import { useState } from "react";
import { ChevronDown, ChevronRight, Wrench, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { ToolCall } from "@/types";

const TOOL_LABELS: Record<string, string> = {
  plan_design: "设计布局",
  write_section: "生成代码",
  render_and_review: "渲染评审",
  edit_section: "修改优化",
};

export function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);
  const label = TOOL_LABELS[toolCall.name] || toolCall.name;

  let argsPreview = "";
  try {
    const parsed = JSON.parse(toolCall.arguments || "{}");
    if (toolCall.name === "plan_design") argsPreview = `${parsed.title || ""} · ${parsed.sections?.length || 0} 个 section`;
    else if (toolCall.name === "write_section") argsPreview = `section ${parsed.sectionId || ""}`;
    else if (toolCall.name === "edit_section") argsPreview = `section ${parsed.sectionId || ""} · ${parsed.changes || ""}`;
    else if (toolCall.name === "render_and_review") argsPreview = "渲染并截图评审";
  } catch {
    argsPreview = toolCall.arguments.slice(0, 40);
  }

  return (
    <div className="my-1.5 rounded-lg border border-brand-500/20 bg-brand-950/40 overflow-hidden">
      <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-brand-500/10 transition-colors">
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-brand-300 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-brand-300 shrink-0" />}
        <Wrench className="w-3.5 h-3.5 text-brand-400 shrink-0" />
        <span className="text-xs font-medium text-brand-200">{label}</span>
        <span className="text-[11px] text-zinc-500 truncate flex-1">{argsPreview}</span>
        <StatusIcon status={toolCall.status} />
      </button>
      {expanded && (
        <div className="px-2.5 pb-2.5 pt-1 space-y-2 border-t border-brand-500/10">
          {toolCall.arguments && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">参数</div>
              <pre className="text-[11px] text-zinc-300 bg-black/30 rounded p-2 overflow-x-auto max-h-40 scroll-thin font-mono">{formatJson(toolCall.arguments)}</pre>
            </div>
          )}
          {toolCall.result && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">结果</div>
              <pre className="text-[11px] text-zinc-300 bg-black/30 rounded p-2 overflow-x-auto max-h-60 scroll-thin whitespace-pre-wrap font-mono">{toolCall.result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: ToolCall["status"] }) {
  if (status === "running" || status === "pending") return <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin shrink-0" />;
  if (status === "done") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  return <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
}

function formatJson(s: string): string {
  try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; }
}
