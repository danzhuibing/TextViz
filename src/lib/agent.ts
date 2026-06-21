import type { AppConfig, Message, DesignDoc, ReviewResult, Section } from "@/types";
import { chatCompletion, chatCompletionStream, type OpenAIToolCall } from "./llm";
import { reviewWithVLM } from "./vlm";
import { TOOL_DEFINITIONS, composeFullHtml, createDesignDocFromPlan, updateSectionHtml } from "./tools";

export const AGENT_SYSTEM_PROMPT = `你是 TextViz，一个专业的信息图（infographic）设计 Agent。你的任务是根据用户提供的文本，通过 ReAct 循环生成一张精美的 self-contained HTML 信息图。

## 工作流程（严格按顺序）

1. **思考**：分析用户文本的核心信息、关键数据、适合的可视化方式
2. **plan_design**：设计整体布局，将画布分为 3-6 个 section，决定每个 section 的内容和视觉类型
3. **write_section**：依次为每个 section 生成 HTML/CSS 代码（每调用一次生成一个 section）
4. **render_and_review**：当所有 section 都生成后，调用此工具渲染并截图，系统会返回 VLM 的 JSON 评审意见
5. **edit_section**：如果 review 未通过，根据评审意见修改有问题的 section
6. 重复 render_and_review → edit_section，直到 review 通过或达到最大轮次

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
- plan_design 只能调用一次
- write_section 必须为每个 section 都调用一次
- 生成完所有 section 后必须调用 render_and_review
- 如果 review 通过（pass=true），用简短文字总结设计并结束
- 如果 review 未通过，调用 edit_section 修改问题 section，然后再次 render_and_review
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
  updateToolCall: (messageId: string, toolCallId: string, patch: { result?: string; status?: "pending" | "running" | "done" | "error" }) => void;
  takeScreenshot: () => Promise<string | null>;
  getUserRequest: () => string;
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
${review.issues.length === 0 ? "（无）" : review.issues.map((i) => `  * [${i.severity}] ${i.section}：${i.description} → 建议：${i.suggestion}`).join("\n")}`;
}

async function executeTool(
  toolCall: OpenAIToolCall,
  callbacks: AgentCallbacks,
  doc: DesignDoc
): Promise<{ result: string; newDoc: DesignDoc }> {
  const args = JSON.parse(toolCall.function.arguments || "{}");
  const name = toolCall.function.name;

  if (name === "plan_design") {
    const newDoc = createDesignDocFromPlan({
      title: args.title,
      theme: args.theme,
      sections: args.sections.map((s: Section) => ({ id: s.id, name: s.name, layout: s.layout, content: s.content, visualType: s.visualType })),
    });
    callbacks.setDesignDoc(newDoc);
    callbacks.setPreviewHtml(newDoc.fullHtml);
    return { result: `已设计布局：${newDoc.title}（${newDoc.sections.length} 个 section）\n${summarizeDoc(newDoc)}`, newDoc };
  }

  if (name === "write_section") {
    const sectionId: string = args.sectionId;
    const html: string = args.html;
    const section = doc.sections.find((s) => s.id === sectionId);
    if (!section) return { result: `错误：找不到 section ${sectionId}`, newDoc: doc };
    const updatedDoc: DesignDoc = { ...doc, sections: doc.sections.map((s) => (s.id === sectionId ? { ...s, html } : s)), version: doc.version };
    updatedDoc.fullHtml = composeFullHtml(updatedDoc);
    callbacks.setDesignDoc(updatedDoc);
    callbacks.setPreviewHtml(updatedDoc.fullHtml);
    return { result: `已为 section ${sectionId}（${section.name}）生成 HTML 代码（${html.length} 字符）`, newDoc: updatedDoc };
  }

  if (name === "render_and_review") {
    callbacks.setAgentStatus("rendering");
    await new Promise((r) => setTimeout(r, 800));
    callbacks.setAgentStatus("reviewing");
    const screenshot = await callbacks.takeScreenshot();
    if (!screenshot) return { result: "截图失败，无法进行 review。请继续。", newDoc: doc };
    const review = await reviewWithVLM(callbacks.getConfig(), screenshot, callbacks.getUserRequest());
    return { result: summarizeReview(review), newDoc: doc };
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
    return { result: `已修改 section ${sectionId}（${section?.name || ""}）：${changes}`, newDoc: updatedDoc };
  }

  return { result: `未知工具：${name}`, newDoc: doc };
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

  for (let turn = 0; turn < maxTurn; turn++) {
    if (signal?.aborted) throw new Error("已停止");

    callbacks.setAgentStatus("thinking");
    const assistantMsgId = callbacks.addMessage({ role: "assistant", content: "", streaming: true });

    try {
      const response = await chatCompletion(config, messages, TOOL_DEFINITIONS, signal);
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
        callbacks.setAgentStatus("done");
        return;
      }

      for (const tc of toolCalls) {
        callbacks.setAgentStatus("calling_tool");
        callbacks.updateToolCall(assistantMsgId, tc.id, { status: "running" });
        try {
          const { result, newDoc } = await executeTool(tc, callbacks, currentDoc);
          currentDoc = newDoc;
          callbacks.updateToolCall(assistantMsgId, tc.id, { status: "done", result });
          messages.push({ id: uid(), role: "tool", content: result, toolCallId: tc.id, createdAt: Date.now() });
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          callbacks.updateToolCall(assistantMsgId, tc.id, { status: "error", result: errMsg });
          messages.push({ id: uid(), role: "tool", content: `工具执行错误：${errMsg}`, toolCallId: tc.id, createdAt: Date.now() });
        }
      }
    } catch (err) {
      callbacks.updateMessage(assistantMsgId, { streaming: false });
      throw err;
    }
  }

  // 达到最大轮次，做最终总结
  callbacks.setAgentStatus("thinking");
  const finalMsgId = callbacks.addMessage({ role: "assistant", content: "", streaming: true });
  try {
    messages.push({ id: uid(), role: "user", content: "已达到最大轮次。请根据当前设计文档，用简短文字总结你完成的信息图设计，不再调用工具。", createdAt: Date.now() });
    const finalText = await chatCompletionStream(config, messages, (delta) => callbacks.appendToMessage(finalMsgId, delta), signal);
    callbacks.updateMessage(finalMsgId, { content: finalText, streaming: false });
  } catch (err) {
    callbacks.updateMessage(finalMsgId, { streaming: false });
    throw err;
  }
  callbacks.setAgentStatus("done");
}
