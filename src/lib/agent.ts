import type { AppConfig, Message, DesignDoc, ReviewResult, Section, Task } from "@/types";
import { chatCompletionStream, chatCompletionStreamWithTools, isVLMModel, type OpenAIToolCall } from "./llm";
import { reviewWithVLM } from "./vlm";
import { TOOL_DEFINITIONS, composeFullHtml, createDesignDocFromPlan, updateSectionHtml } from "./tools";

export const AGENT_SYSTEM_PROMPT = `你是 TextViz，一个专业的信息图（infographic）设计 Agent。你的任务是根据用户提供的文本，通过 ReAct 循环生成一张精美的 self-contained HTML 信息图。

## 工作流程（严格按顺序）

1. **思考**：分析用户文本的核心信息、关键数据、适合的可视化方式
2. **plan_design**：设计整体布局，将画布分为 3-6 个 section，决定每个 section 的内容和视觉类型
3. **add_tasks**：立即调用此工具，将所有需要完成的工作记录为任务（每个 section 的代码生成 + 渲染评审 + 可能的修改）
4. **update_task** → in_progress：标记要开始的任务
5. **write_section**：依次为每个 section 生成 HTML/CSS 代码（每调用一次生成一个 section）
6. **update_task** → done：标记已完成的任务
7. **render_and_review**：当所有 section 都生成后，调用此工具渲染并截图，系统会返回 VLM 的 JSON 评审意见（suggestion 字段包含精确的 HTML/CSS 修改方案）
8. **edit_section**：如果 review 未通过，严格按照 suggestion 的精确修改方案修改有问题的 section
9. 重复 render_and_review → edit_section，直到 review 通过或达到最大轮次

## 设计要求

- 画布固定宽度 800px，居中
- 配色要协调，主色 + 辅助色不超过 3 种
- 字体层次清晰：标题 32-48px，副标题 20-24px，正文 14-16px，数据 28-40px
- 每个 section 的 HTML 必须是 self-contained 片段，使用内联 <style> 或 style 属性
- 不要包含 html/head/body 标签
- 可以使用 SVG 绘制图标、图表、装饰元素
- 内容要准确反映用户提供的文本信息
- 避免内容溢出和重叠

## 重要规则

- 一次只调用一个工具
- **plan_design 只能调用一次**。一旦进入 write_section 或后续阶段，绝对不允许再调用 plan_design。如果需要修改设计，请使用 edit_section
- **add_tasks 在 plan_design 之后立即调用**，将所有工作拆解为任务
- **每次调用 write_section 或 edit_section 前后，都要用 update_task 更新对应任务状态**
- write_section 必须为每个 section 都调用一次
- 生成完所有 section 后必须调用 render_and_review
- **edit_section 的 changes 字段必须精确描述修改内容**，对应 review 给出的 suggestion（如「将 .title font-size 从 24px 改为 32px」），禁止使用「调大字号」「优化样式」等模糊描述
- 如果 review 通过（pass=true），用简短文字总结设计并结束
- 如果 review 未通过，调用 edit_section 严格按照 suggestion 修改问题 section，然后再次 render_and_review
- **finalize（结束）的前提**：所有 task 都标记为 done，且 review 通过（pass=true）。不满足条件时继续工作
- 回复用户时使用中文`;

export interface AgentCallbacks {
  getConfig: () => AppConfig;
  getDesignDoc: () => DesignDoc | null;
  setDesignDoc: (doc: DesignDoc) => void;
  setPreviewHtml: (html: string) => void;
  setAgentStatus: (status: string) => void;
  addMessage: (msg: Omit<Message, "id" | "createdAt">) => string;
  updateMessage: (id: string, patch: Partial<Message>) => void;
  appendToMessage: (id: string, text: string) => void;
  addToolCall: (messageId: string, toolCall: { id: string; name: string; arguments: string; status: "pending" | "running" | "done" | "error" }) => void;
  updateToolCall: (messageId: string, toolCallId: string, patch: { result?: string; status?: "pending" | "running" | "done" | "error"; arguments?: string }) => void;
  takeScreenshot: () => Promise<string | null>;
  getUserRequest: () => string;
  // Task 管理
  getTasks: () => Task[];
  setTasks: (tasks: Task[]) => void;
  addTasks: (tasks: Task[]) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  clearTasks: () => void;
  // 写代码进度
  setWritingProgress: (p: { sectionId: string; chars: number; total: number | null } | null) => void;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function summarizeDoc(doc: DesignDoc): string {
  return `当前设计文档（v${doc.version}）：
标题：${doc.title}
主题：${doc.theme}
Sections：
${doc.sections.map((s) => `- ${s.id} [${s.layout}/${s.visualType}] ${s.name}：${s.content}（HTML ${s.html ? "已生成" : "未生成"}）`).join("\n")}`;
}

function summarizeReview(review: ReviewResult): string {
  return `VLM Review 结果：
- 通过：${review.pass ? "是" : "否"}
- 分数：${review.score}/100
- 总结：${review.summary}
- 问题列表：
${review.issues.length === 0 ? "（无）" : review.issues.map((i) => `  * [${i.severity}] ${i.section}：${i.description} → 修改方案：${i.suggestion}`).join("\n")}`;
}

function summarizeTasks(tasks: Task[]): string {
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  return `任务进度（${done}/${tasks.length} 完成，${inProgress} 进行中，${pending} 待开始）：
${tasks.map((t) => `- [${t.status === "done" ? "x" : t.status === "in_progress" ? "~" : " "}] ${t.id}：${t.description}`).join("\n")}`;
}

async function executeTool(
  toolCall: OpenAIToolCall,
  callbacks: AgentCallbacks,
  doc: DesignDoc,
  hasPlanned: boolean
): Promise<{ result: string; newDoc: DesignDoc; hasPlanned: boolean }> {
  const args = JSON.parse(toolCall.function.arguments || "{}");
  const name = toolCall.function.name;

  // 防死循环：plan_design 只能调用一次
  if (name === "plan_design") {
    if (hasPlanned || doc.version > 0) {
      return {
        result: `错误：plan_design 已经调用过，不允许重复调用。当前已进入修改阶段，请使用 edit_section 修改 section 内容，或用简短文字总结并结束。`,
        newDoc: doc,
        hasPlanned: hasPlanned,
      };
    }
    const newDoc = createDesignDocFromPlan({
      title: args.title,
      theme: args.theme,
      sections: args.sections.map((s: Section) => ({ id: s.id, name: s.name, layout: s.layout, content: s.content, visualType: s.visualType })),
    });
    callbacks.setDesignDoc(newDoc);
    callbacks.setPreviewHtml(newDoc.fullHtml);
    return { result: `已设计布局：${newDoc.title}（${newDoc.sections.length} 个 section）\n${summarizeDoc(newDoc)}\n\n请接下来调用 add_tasks 记录所有任务。`, newDoc, hasPlanned: true };
  }

  if (name === "add_tasks") {
    const tasks: Task[] = args.tasks.map((t: { id: string; description: string }) => ({
      id: t.id,
      description: t.description,
      status: "pending" as const,
      createdAt: Date.now(),
    }));
    callbacks.addTasks(tasks);
    return { result: `已添加 ${tasks.length} 个任务：\n${summarizeTasks(callbacks.getTasks())}`, newDoc: doc, hasPlanned };
  }

  if (name === "update_task") {
    const taskId: string = args.taskId;
    const status: "in_progress" | "done" = args.status;
    callbacks.updateTask(taskId, { status, completedAt: status === "done" ? Date.now() : undefined });
    return { result: `任务 ${taskId} 已更新为 ${status}\n${summarizeTasks(callbacks.getTasks())}`, newDoc: doc, hasPlanned };
  }

  if (name === "write_section") {
    const sectionId: string = args.sectionId;
    const html: string = args.html;
    const section = doc.sections.find((s) => s.id === sectionId);
    if (!section) return { result: `错误：找不到 section ${sectionId}`, newDoc: doc, hasPlanned };
    const updatedDoc: DesignDoc = { ...doc, sections: doc.sections.map((s) => (s.id === sectionId ? { ...s, html } : s)), version: doc.version };
    updatedDoc.fullHtml = composeFullHtml(updatedDoc);
    callbacks.setDesignDoc(updatedDoc);
    callbacks.setPreviewHtml(updatedDoc.fullHtml);
    return { result: `已为 section ${sectionId}（${section.name}）生成 HTML 代码（${html.length} 字符）`, newDoc: updatedDoc, hasPlanned };
  }

  if (name === "render_and_review") {
    callbacks.setAgentStatus("rendering");
    await new Promise((r) => setTimeout(r, 800));
    callbacks.setAgentStatus("reviewing");
    const screenshot = await callbacks.takeScreenshot();
    if (!screenshot) return { result: "截图失败，无法进行 review。请继续。", newDoc: doc, hasPlanned };
    const review = await reviewWithVLM(callbacks.getConfig(), screenshot, callbacks.getUserRequest());
    return { result: summarizeReview(review), newDoc: doc, hasPlanned };
  }

  if (name === "edit_section") {
    const sectionId: string = args.sectionId;
    const changes: string = args.changes;
    const newHtml: string = args.newHtml;
    const updatedDoc = updateSectionHtml(doc, sectionId, newHtml);
    updatedDoc.fullHtml = composeFullHtml(updatedDoc);
    callbacks.setDesignDoc(updatedDoc);
    callbacks.setPreviewHtml(updatedDoc.fullHtml);
    const section = updatedDoc.sections.find((s) => s.id === sectionId);
    return { result: `已修改 section ${sectionId}（${section?.name || ""}）：${changes}`, newDoc: updatedDoc, hasPlanned };
  }

  return { result: `未知工具：${name}`, newDoc: doc, hasPlanned };
}

export async function runAgent(
  userText: string,
  callbacks: AgentCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const config = callbacks.getConfig();
  const maxTurn = config.maxTurn || 5;

  const messages: Message[] = [
    { id: uid(), role: "system", content: AGENT_SYSTEM_PROMPT, createdAt: Date.now() },
    { id: uid(), role: "user", content: userText, createdAt: Date.now() },
  ];

  let currentDoc = callbacks.getDesignDoc() || { title: "", theme: "", sections: [], fullHtml: "", version: 0 };
  let hasPlanned = currentDoc.version > 0;

  // 检测 LLM 是否是 VLM，如果是则在请求时带上截图
  const llmIsVLM = isVLMModel(config.model);

  for (let turn = 0; turn < maxTurn; turn++) {
    if (signal?.aborted) throw new Error("已停止");

    callbacks.setAgentStatus("thinking");
    const assistantMsgId = callbacks.addMessage({ role: "assistant", content: "", streaming: true });

    try {
      // 如果 LLM 是 VLM 且已有预览内容，截图带上
      let imageBase64: string | undefined;
      if (llmIsVLM && currentDoc.fullHtml) {
        callbacks.setAgentStatus("rendering");
        imageBase64 = await callbacks.takeScreenshot() || undefined;
        callbacks.setAgentStatus("thinking");
      }

      // 维护 tool_call arguments 的累积器，用于实时进度展示
      const toolArgsAccumulator = new Map<string, { name: string; args: string }>();

      // 使用流式请求支持 tool_call，实时展示 write_section 的进度
      const response = await chatCompletionStreamWithTools(
        config,
        messages,
        TOOL_DEFINITIONS,
        (toolCallId, functionName, argsDelta) => {
          // 累积 arguments
          if (!toolArgsAccumulator.has(toolCallId)) {
            toolArgsAccumulator.set(toolCallId, { name: functionName, args: "" });
          }
          const entry = toolArgsAccumulator.get(toolCallId)!;
          if (functionName) entry.name = functionName;
          entry.args += argsDelta;

          // 尝试解析累积的 arguments，更新进度
          if (entry.name === "write_section" || entry.name === "edit_section") {
            try {
              const partial = JSON.parse(entry.args);
              const sectionId = partial.sectionId || "";
              const htmlLen = (partial.html || partial.newHtml || "").length;
              if (sectionId) {
                callbacks.setWritingProgress({ sectionId, chars: htmlLen, total: null });
              }
            } catch {
              /* partial JSON, ignore */
            }
          }
        },
        (delta) => {
          callbacks.appendToMessage(assistantMsgId, delta);
        },
        signal,
        imageBase64
      );

      const choice = response.choices[0];
      const assistantContent = choice.message.content || "";
      const toolCalls = choice.message.tool_calls;

      callbacks.updateMessage(assistantMsgId, {
        content: assistantContent,
        streaming: false,
        toolCalls: toolCalls
          ? toolCalls.map((tc) => ({ id: tc.id, name: tc.function.name, arguments: tc.function.arguments, status: "pending" as const }))
          : undefined,
      });

      messages.push({
        id: assistantMsgId,
        role: "assistant",
        content: assistantContent,
        createdAt: Date.now(),
        toolCalls: toolCalls
          ? toolCalls.map((tc) => ({ id: tc.id, name: tc.function.name, arguments: tc.function.arguments, status: "pending" as const }))
          : undefined,
      });

      if (!toolCalls || toolCalls.length === 0) {
        // 检查是否所有 task 都完成了
        const tasks = callbacks.getTasks();
        const allDone = tasks.length === 0 || tasks.every((t) => t.status === "done");
        if (!allDone) {
          // 还有未完成的 task，提醒继续
          messages.push({
            id: uid(),
            role: "user",
            content: `还有未完成的任务，请继续：\n${summarizeTasks(tasks)}\n\n请继续调用工具完成任务，不要用文字总结。`,
            createdAt: Date.now(),
          });
          continue;
        }
        callbacks.setAgentStatus("done");
        return;
      }

      for (const tc of toolCalls) {
        callbacks.setAgentStatus("calling_tool");
        callbacks.updateToolCall(assistantMsgId, tc.id, { status: "running" });

        // 如果是 write_section 或 edit_section，显示写代码进度
        if (tc.function.name === "write_section" || tc.function.name === "edit_section") {
          try {
            const args = JSON.parse(tc.function.arguments);
            const sectionId = args.sectionId || "";
            const htmlLen = (args.html || args.newHtml || "").length;
            callbacks.setWritingProgress({ sectionId, chars: htmlLen, total: htmlLen });
          } catch {
            /* ignore */
          }
        }

        try {
          const { result, newDoc, hasPlanned: planned } = await executeTool(tc, callbacks, currentDoc, hasPlanned);
          currentDoc = newDoc;
          hasPlanned = planned;
          callbacks.updateToolCall(assistantMsgId, tc.id, { status: "done", result });
          messages.push({ id: uid(), role: "tool", content: result, toolCallId: tc.id, createdAt: Date.now() });
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          callbacks.updateToolCall(assistantMsgId, tc.id, { status: "error", result: errMsg });
          messages.push({ id: uid(), role: "tool", content: `工具执行错误：${errMsg}`, toolCallId: tc.id, createdAt: Date.now() });
        }

        callbacks.setWritingProgress(null);
      }
    } catch (err) {
      callbacks.updateMessage(assistantMsgId, { streaming: false });
      throw err;
    }
  }

  // 达到最大轮次，做最终总结
  // 检查是否所有 task 都完成了
  const tasks = callbacks.getTasks();
  const allDone = tasks.length === 0 || tasks.every((t) => t.status === "done");

  callbacks.setAgentStatus("thinking");
  const finalMsgId = callbacks.addMessage({ role: "assistant", content: "", streaming: true });
  try {
    if (!allDone) {
      messages.push({
        id: uid(),
        role: "user",
        content: `已达到最大轮次。当前任务状态：\n${summarizeTasks(tasks)}\n\n请根据当前设计文档，用简短文字总结你完成的信息图设计，不再调用工具。`,
        createdAt: Date.now(),
      });
    } else {
      messages.push({
        id: uid(),
        role: "user",
        content: "所有任务已完成。请根据当前设计文档，用简短文字总结你完成的信息图设计，不再调用工具。",
        createdAt: Date.now(),
      });
    }
    const finalText = await chatCompletionStream(config, messages, (delta) => callbacks.appendToMessage(finalMsgId, delta), signal);
    callbacks.updateMessage(finalMsgId, { content: finalText, streaming: false });
  } catch (err) {
    callbacks.updateMessage(finalMsgId, { streaming: false });
    throw err;
  }
  callbacks.setAgentStatus("done");
}
