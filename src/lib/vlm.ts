import type { AppConfig, ReviewResult } from "@/types";
import { startRequestLog, finishRequestLog } from "./requestLog";

export async function reviewWithVLM(
  config: AppConfig,
  imageBase64: string,
  context: string,
  signal?: AbortSignal
): Promise<ReviewResult> {
  const url = `${config.vlmBaseUrl.replace(/\/$/, "")}/chat/completions`;
  const systemPrompt = `你是一位资深的信息图（infographic）设计评审专家。你将看到一张信息图的截图和用户的原始需求。
请仔细评审这张信息图的设计质量，包括：
1. 视觉层次是否清晰
2. 配色是否协调、可读性是否良好
3. 内容是否完整准确地反映了用户需求
4. 排版布局是否合理、是否有溢出或重叠
5. 字体大小是否合适
6. 图形/图标/SVG 是否恰当

请以严格的 JSON 格式输出评审结果，不要包含任何其他文字或 markdown 标记。JSON schema：
{
  "pass": boolean,
  "score": number,
  "issues": [
    {
      "section": "string（section id，如 s1/s2）",
      "severity": "high"|"medium"|"low",
      "description": "string（问题描述）",
      "suggestion": "string（**必须精确到具体的 HTML/CSS 修改方案**，例如：将 .title 的 font-size 从 24px 改为 32px；将背景色从 #eee 改为 #1a56db；删除 .desc 的 margin-top: 20px。禁止使用'调大'、'调小'、'优化'等模糊词汇）"
    }
  ],
  "summary": "string"
}

如果没有问题，issues 返回空数组，pass 为 true，score 为 90-100。

重要：suggestion 字段必须包含可执行的精确修改指令，格式为「将 X 从 A 改为 B」或「在 X 上添加属性 Y: Z」。不要给出模糊的建议。`;

  const userPrompt = `用户原始需求：\n${context}\n\n请评审这张信息图截图。`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.vlmApiKey}`,
  };
  const body = {
    model: config.vlmModel,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } },
        ],
      },
    ],
    max_tokens: 1024,
    temperature: 0.3,
  };

  const logId = startRequestLog("vlm", url, "POST", headers, body);
  const startTime = Date.now();

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });
  const duration = Date.now() - startTime;

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    finishRequestLog(logId, { error: `HTTP ${res.status}: ${text.slice(0, 500)}`, duration });
    throw new Error(`VLM 请求失败 ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content || "";
  finishRequestLog(logId, { status: res.status, responseBody: JSON.stringify(data), duration });

  const jsonStr = extractJson(content);
  if (!jsonStr) {
    return { pass: false, score: 50, issues: [], summary: "VLM 返回内容无法解析为 JSON：" + content.slice(0, 200) };
  }
  try {
    return JSON.parse(jsonStr) as ReviewResult;
  } catch {
    return { pass: false, score: 50, issues: [], summary: "VLM 返回 JSON 解析失败：" + jsonStr.slice(0, 200) };
  }
}

function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
  return null;
}
