import type { RequestLog } from "@/types";
import { useStore } from "@/store/useStore";

let logCounter = 0;

function uid() {
  return `log_${Date.now()}_${++logCounter}`;
}

/** 记录一次大模型请求（在 fetch 前调用，返回 logId 用于后续更新） */
export function startRequestLog(
  type: "llm" | "vlm",
  url: string,
  method: string,
  headers: Record<string, string>,
  body: unknown
): string {
  const id = uid();
  const log: RequestLog = {
    id,
    timestamp: Date.now(),
    type,
    url,
    method,
    headers,
    requestBody: body,
    status: null,
    responseBody: null,
    duration: null,
  };
  useStore.getState().addRequestLog(log);
  return id;
}

/** 更新请求日志（在 fetch 完成后调用） */
export function finishRequestLog(
  logId: string,
  result: { status: number; responseBody: string; duration: number } | { error: string; duration: number }
) {
  const logs = useStore.getState().requestLogs;
  const idx = logs.findIndex((l) => l.id === logId);
  if (idx === -1) return;
  const updated = [...logs];
  if ("error" in result) {
    updated[idx] = { ...updated[idx], error: result.error, duration: result.duration };
  } else {
    updated[idx] = { ...updated[idx], status: result.status, responseBody: result.responseBody, duration: result.duration };
  }
  useStore.setState({ requestLogs: updated });
}

/** 把请求日志转成 curl 命令 */
export function toCurlCommand(log: RequestLog): string {
  const parts = [`curl -X ${log.method} '${log.url}'`];
  for (const [k, v] of Object.entries(log.headers)) {
    // 脱敏 apiKey，只显示前 8 位
    const masked = k.toLowerCase() === "authorization" ? `${v.slice(0, 15)}...` : v;
    parts.push(`  -H '${k}: ${masked}'`);
  }
  if (log.requestBody) {
    parts.push(`  -d '${JSON.stringify(log.requestBody)}'`);
  }
  return parts.join(" \\\n");
}
