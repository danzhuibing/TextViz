import { useState } from "react";
import { Code2, FileJson, Terminal, X, Trash2, ChevronDown, ChevronRight, Check, Copy } from "lucide-react";
import { useStore } from "@/store/useStore";
import { toCurlCommand } from "@/lib/requestLog";
import type { RequestLog } from "@/types";

export function RequestLogPanel() {
  const logPanelOpen = useStore((s) => s.logPanelOpen);
  const setLogPanelOpen = useStore((s) => s.setLogPanelOpen);
  const requestLogs = useStore((s) => s.requestLogs);
  const clearRequestLogs = useStore((s) => s.clearRequestLogs);

  if (!logPanelOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-72 bg-zinc-950/95 border-t border-zinc-800 z-50 flex flex-col backdrop-blur-sm">
      {/* 头部 */}
      <div className="shrink-0 flex items-center justify-between px-3 h-10 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-semibold text-zinc-200">请求日志</span>
          <span className="text-[10px] text-zinc-500">({requestLogs.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearRequestLogs}
            title="清空日志"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLogPanelOpen(false)}
            title="关闭"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="flex-1 overflow-y-auto scroll-thin">
        {requestLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-600">暂无请求日志</div>
        ) : (
          <div className="divide-y divide-zinc-800/40">
            {[...requestLogs].reverse().map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LogItem({ log }: { log: RequestLog }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<"curl" | "body" | null>(null);

  const time = new Date(log.timestamp).toLocaleTimeString("zh-CN", { hour12: false });
  const typeLabel = log.type === "llm" ? "LLM" : "VLM";
  const typeColor = log.type === "llm" ? "text-brand-400 bg-brand-950/60" : "text-purple-400 bg-purple-950/40";
  const statusColor = log.error
    ? "text-red-400"
    : log.status && log.status >= 200 && log.status < 300
    ? "text-emerald-400"
    : "text-yellow-400";
  const statusText = log.error ? "ERR" : log.status || "...";

  const handleCopyCurl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(toCurlCommand(log));
    setCopied("curl");
    setTimeout(() => setCopied(null), 1500);
  };

  const handleCopyBody = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(log.requestBody, null, 2));
    setCopied("body");
    setTimeout(() => setCopied(null), 1500);
  };

  // 从 requestBody 中提取 model
  const model = (log.requestBody as { model?: string })?.model || "";

  return (
    <div className="hover:bg-zinc-900/40">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3 text-zinc-600 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
        )}
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${typeColor}`}>{typeLabel}</span>
        <span className="text-[10px] text-zinc-500 font-mono shrink-0">{time}</span>
        {model && <span className="text-[10px] text-zinc-400 truncate flex-1">{model}</span>}
        <span className={`text-[10px] font-mono shrink-0 ${statusColor}`}>{statusText}</span>
        {log.duration !== null && (
          <span className="text-[10px] text-zinc-600 shrink-0">{log.duration}ms</span>
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-2 space-y-2">
          {/* URL */}
          <div className="text-[10px] text-zinc-500 font-mono truncate">{log.url}</div>

          {/* Copy 按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCurl}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              {copied === "curl" ? <Check className="w-3 h-3 text-emerald-400" /> : <Terminal className="w-3 h-3" />}
              {copied === "curl" ? "已复制" : "Copy curl"}
            </button>
            <button
              onClick={handleCopyBody}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              {copied === "body" ? <Check className="w-3 h-3 text-emerald-400" /> : <FileJson className="w-3 h-3" />}
              {copied === "body" ? "已复制" : "Copy body"}
            </button>
          </div>

          {/* Request Body */}
          {log.requestBody && (
            <div>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                <Code2 className="w-3 h-3" /> Request Body
              </div>
              <pre className="text-[10px] text-zinc-300 bg-black/40 rounded p-2 overflow-x-auto max-h-40 scroll-thin font-mono">
                {JSON.stringify(log.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Response / Error */}
          {log.error ? (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-red-400 mb-1">Error</div>
              <pre className="text-[10px] text-red-300 bg-red-950/30 rounded p-2 overflow-x-auto max-h-40 scroll-thin font-mono whitespace-pre-wrap">
                {log.error}
              </pre>
            </div>
          ) : (
            log.responseBody && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Response</div>
                <pre className="text-[10px] text-zinc-300 bg-black/40 rounded p-2 overflow-x-auto max-h-40 scroll-thin font-mono">
                  {formatResponse(log.responseBody)}
                </pre>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function formatResponse(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}
