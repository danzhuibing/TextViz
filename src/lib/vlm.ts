import type { AppConfig, ReviewResult } from "@/types";

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
    { "section": "string", "severity": "high"|"medium"|"low", "description": "string", "suggestion": "string" }
  ],
  "summary": "string"
}

如果没有问题，issues 返回空数组，pass 为 true，score 为 90-100。`;

  const userPrompt = `用户原始需求：\n${context}\n\n请评审这张信息图截图。`;

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

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.vlmApiKey}` },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`VLM 请求失败 ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content || "";
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
