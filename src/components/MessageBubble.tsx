import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { OctopusLogo } from "./OctopusLogo";
import { ToolCallCard } from "./ToolCallCard";
import type { Message } from "@/types";
import { cn } from "@/lib/utils";

export function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-brand-600 px-3.5 py-2 text-sm text-white shadow-md shadow-brand-900/30">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }
  if (message.role === "tool") return null;

  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;
  const hasContent = message.content && message.content.trim().length > 0;

  return (
    <div className="flex gap-2 animate-slide-up">
      <div className="shrink-0 mt-0.5">
        <div className="w-7 h-7 rounded-full bg-brand-900/60 border border-brand-500/30 flex items-center justify-center overflow-hidden">
          <OctopusLogo size={20} />
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        {hasContent && (
          <div className={cn("max-w-[95%] rounded-2xl rounded-tl-md bg-zinc-800/70 border border-zinc-700/50 px-3.5 py-2 text-sm text-zinc-100 md-body", message.streaming && "stream-cursor")}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
        {hasToolCalls && (
          <div className="space-y-1">
            {message.toolCalls!.map((tc) => (<ToolCallCard key={tc.id} toolCall={tc} />))}
          </div>
        )}
        {!hasContent && !hasToolCalls && message.streaming && (
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-300 px-2 py-1">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse-soft" />
            <span>思考中...</span>
          </div>
        )}
      </div>
    </div>
  );
}
