import type { DesignDoc, Section } from "@/types";

export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "plan_design",
      description:
        "根据用户输入的文本，设计信息图的整体布局。将画布分为若干个 section，并决定每个 section 要展示的内容、布局方式和视觉类型。这是生成信息图的第一步。注意：此工具只能在开始时调用一次，后续修改阶段不允许再调用。",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "信息图的主标题" },
          theme: { type: "string", description: "配色主题描述，例如：深蓝科技风、暖色温馨风、绿色自然风等" },
          sections: {
            type: "array",
            description: "信息图的所有 section 列表，建议 3-6 个",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "section 唯一标识，如 s1, s2" },
                name: { type: "string", description: "section 名称，如 标题区、数据统计区" },
                layout: { type: "string", description: "布局方式：full(整行) / half(半行) / third(三分之一)" },
                content: { type: "string", description: "该 section 要展示的具体内容摘要" },
                visualType: { type: "string", description: "视觉类型：title/text/stat/chart/timeline/list/icon/quote" },
              },
              required: ["id", "name", "layout", "content", "visualType"],
            },
          },
        },
        required: ["title", "theme", "sections"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "write_section",
      description:
        "为指定的 section 生成具体的 HTML/CSS 代码。生成的 HTML 必须是 self-contained 的片段（不含 html/head/body 标签），使用内联 style 或 <style> 标签。",
      parameters: {
        type: "object",
        properties: {
          sectionId: { type: "string", description: "要生成代码的 section id" },
          html: { type: "string", description: "该 section 的 HTML 代码片段，self-contained，包含内联样式。不要包含 html/head/body 标签。" },
        },
        required: ["sectionId", "html"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "render_and_review",
      description: "渲染当前已生成的完整信息图 HTML，并截图交给 VLM 视觉模型进行 review。调用此工具后系统会返回 JSON 格式的评审意见，其中 suggestion 字段包含精确的 HTML/CSS 修改方案。无需传参。",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "edit_section",
      description:
        "根据 review 评审意见修改指定 section 的内容。review 返回的 suggestion 会给出精确的修改方案（如「将 .title 的 font-size 从 24px 改为 32px」），请严格按照 suggestion 执行修改。需要提供修改后的完整 section HTML。",
      parameters: {
        type: "object",
        properties: {
          sectionId: { type: "string", description: "要修改的 section id" },
          changes: { type: "string", description: "本次修改的说明，应精确对应 review 给出的 suggestion，如「将 .title font-size 从 24px 改为 32px」" },
          newHtml: { type: "string", description: "修改后的完整 section HTML 代码片段" },
        },
        required: ["sectionId", "changes", "newHtml"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "add_tasks",
      description:
        "批量添加任务到任务列表，用于追踪工作进度。在 plan_design 之后应立即调用此工具，将所有需要完成的工作记录为任务。每个任务应有清晰的描述。",
      parameters: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            description: "任务列表",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "任务 id，如 t1, t2" },
                description: { type: "string", description: "任务描述，如「为 section s1 生成标题区 HTML 代码」" },
              },
              required: ["id", "description"],
            },
          },
        },
        required: ["tasks"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_task",
      description:
        "更新任务状态。开始执行任务时标记为 in_progress，完成时标记为 done。每次调用 write_section、edit_section 等工具前后都应更新对应任务的状态。",
      parameters: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "要更新的任务 id" },
          status: { type: "string", enum: ["in_progress", "done"], description: "新状态：in_progress（开始执行）或 done（已完成）" },
        },
        required: ["taskId", "status"],
      },
    },
  },
];

export function composeFullHtml(doc: DesignDoc): string {
  const sectionsHtml = doc.sections
    .map((s) => `<!-- Section: ${s.name} (${s.id}) -->\n<div class="section section-${s.layout}" data-section-id="${s.id}">\n${s.html}\n</div>`)
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(doc.title)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "PingFang SC", "Microsoft YaHei", "Inter", system-ui, sans-serif; background: #ffffff; color: #1f2937; padding: 0; }
  .infographic { width: 800px; margin: 0 auto; padding: 40px; background: #ffffff; }
  .section { margin-bottom: 24px; }
  .section-full { width: 100%; }
  .section-half { width: 100%; }
  .section-third { width: 100%; }
  @media (max-width: 840px) { .infographic { width: 100%; padding: 20px; } }
</style>
</head>
<body>
<div class="infographic">
${sectionsHtml}
</div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function updateSectionHtml(doc: DesignDoc, sectionId: string, newHtml: string): DesignDoc {
  return {
    ...doc,
    sections: doc.sections.map((s) => (s.id === sectionId ? { ...s, html: newHtml } : s)),
    version: doc.version + 1,
  };
}

export function createDesignDocFromPlan(plan: { title: string; theme: string; sections: Array<Omit<Section, "html">> }): DesignDoc {
  const sections: Section[] = plan.sections.map((s) => ({ ...s, html: "" }));
  const doc: DesignDoc = { title: plan.title, theme: plan.theme, sections, fullHtml: "", version: 1 };
  doc.fullHtml = composeFullHtml(doc);
  return doc;
}
