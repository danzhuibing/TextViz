import type { AppConfig, Message } from "@/types";
import { startRequestLog, finishRequestLog } from "./requestLog";

export interface OpenAIToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: "assistant";
      content: string | null;
      tool_calls?: OpenAIToolCall[];
    };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export function toOpenAIMessages(messages: Message[]) {
  return messages.map((m) => {
    if (m.role === "tool") {
      return { role: "tool" as const, content: m.content, tool_call_id: m.toolCallId };
    }
    if (m.role === "assistant" && m.toolCalls && m.toolCalls.length > 0) {
      return {
        role: "assistant" as const,
        content: m.content || null,
        tool_calls: m.toolCalls.map((tc) => ({
          id: tc.id,
          type: "function" as const,
          function: { name: tc.name, arguments: tc.arguments },
        })),
      };
    }
    return { role: m.role, content: m.content };
  }) as Array<Record<string, unknown>>;
}

/** 判断模型是否可能是 VLM（视觉模型） */
export function isVLMModel(model: string): boolean {
  const m = model.toLowerCase();
  return (
    m.includes("vl") ||
    m.includes("vision") ||
    m.includes("minimax-m") ||
    m.includes("gpt-4o") ||
    m.includes("claude-3") ||
    m.includes("gemini") ||
    m.includes("qwen-vl") ||
    m.includes("internvl")
  );
}

export async function chatCompletion(
  config: AppConfig,
  messages: Message[],
  tools?: unknown[],
  signal?: AbortSignal,
  /** 可选：附加图片（用于 VLM 模型），base64 不带前缀 */
  imageBase64?: string
): Promise<ChatCompletionResponse> {
  const url = `${config.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`,
  };
  const body: Record<string, unknown> = {
    model: config.model,
    messages: toOpenAIMessagesWithImage(messages, imageBase64),
    max_tokens: config.maxTokens,
    temperature: 0.7,
  };
  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const logId = startRequestLog("llm", url, "POST", headers, body);
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
    throw new Error(`LLM 请求失败 ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as ChatCompletionResponse;
  finishRequestLog(logId, { status: res.status, responseBody: JSON.stringify(data), duration });
  return data;
}

/** 如果提供了 imageBase64，在最后一条 user 消息中附加图片（用于 VLM 模型） */
function toOpenAIMessagesWithImage(messages: Message[], imageBase64?: string) {
  const result = toOpenAIMessages(messages);
  if (!imageBase64 || result.length === 0) return result;

  // 找最后一条 user 消息，转为多模态
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i].role === "user") {
      const textContent = typeof result[i].content === "string" ? result[i].content : "";
      result[i] = {
        role: "user",
        content: [
          { type: "text", text: textContent },
          { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } },
        ],
      };
      break;
    }
  }
  return result;
}

export async function chatCompletionStream(
  config: AppConfig,
  messages: Message[],
  onDelta: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const url = `${config.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`,
  };
  const body = {
    model: config.model,
    messages: toOpenAIMessages(messages),
    max_tokens: config.maxTokens,
    temperature: 0.7,
    stream: true,
  };

  const logId = startRequestLog("llm", url, "POST", headers, { ...body, stream: true });
  const startTime = Date.now();

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    const duration = Date.now() - startTime;
    finishRequestLog(logId, { error: `HTTP ${res.status}: ${text.slice(0, 500)}`, duration });
    throw new Error(`LLM 流式请求失败 ${res.status}: ${text.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      } catch {
        /* skip */
      }
    }
  }
  const duration = Date.now() - startTime;
  finishRequestLog(logId, { status: res.status, responseBody: full, duration });
  return full;
}

/**
 * 流式 chatCompletion，支持实时返回 tool_call arguments 增量。
 * 用于 write_section 等工具的进度展示。
 */
export async function chatCompletionStreamWithTools(
  config: AppConfig,
  messages: Message[],
  tools: unknown[],
  onToolDelta: (toolCallId: string, functionName: string, argumentsDelta: string) => void,
  onContentDelta: (text: string) => void,
  signal?: AbortSignal,
  /** 可选：附加图片（用于 VLM 模型），base64 不带前缀 */
  imageBase64?: string
): Promise<ChatCompletionResponse> {
  const url = `${config.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`,
  };
  const body = {
    model: config.model,
    messages: toOpenAIMessagesWithImage(messages, imageBase64),
    max_tokens: config.maxTokens,
    temperature: 0.7,
    tools,
    tool_choice: "auto",
    stream: true,
  };

  const logId = startRequestLog("llm", url, "POST", headers, { ...body, stream: true });
  const startTime = Date.now();

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    const duration = Date.now() - startTime;
    finishRequestLog(logId, { error: `HTTP ${res.status}: ${text.slice(0, 500)}`, duration });
    throw new Error(`LLM 流式请求失败 ${res.status}: ${text.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  const toolCallsMap = new Map<string, { id: string; name: string; arguments: string }>();
  let finishReason = "stop";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta;
        if (delta?.content) {
          content += delta.content;
          onContentDelta(delta.content);
        }
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;
            const id = tc.id || `tc_${idx}`;
            const name = tc.function?.name || "";
            const argsDelta = tc.function?.arguments || "";
            if (!toolCallsMap.has(id)) {
              toolCallsMap.set(id, { id, name, arguments: "" });
            }
            const entry = toolCallsMap.get(id)!;
            if (name) entry.name = name;
            entry.arguments += argsDelta;
            onToolDelta(id, entry.name, argsDelta);
          }
        }
        if (json.choices?.[0]?.finish_reason) {
          finishReason = json.choices[0].finish_reason;
        }
      } catch {
        /* skip */
      }
    }
  }

  const duration = Date.now() - startTime;
  const toolCalls = Array.from(toolCallsMap.values()).filter((tc) => tc.name);
  const response: ChatCompletionResponse = {
    choices: [
      {
        message: {
          role: "assistant",
          content: content || null,
          tool_calls: toolCalls.length > 0 ? toolCalls.map((tc) => ({ id: tc.id, type: "function" as const, function: { name: tc.name, arguments: tc.arguments } })) : undefined,
        },
        finish_reason: finishReason,
      },
    ],
  };
  finishRequestLog(logId, { status: res.status, responseBody: JSON.stringify(response), duration });
  return response;
}
