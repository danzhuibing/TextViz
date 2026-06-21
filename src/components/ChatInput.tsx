import { useEffect, useRef, useState } from "react";
import { Send, Square } from "lucide-react";
import { useStore } from "@/store/useStore";

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
}

export function ChatInput({ onSend, onStop }: ChatInputProps) {
  const [text, setText] = useState("");
  const isGenerating = useStore((s) => s.isGenerating);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-zinc-800/80 bg-zinc-950/60 backdrop-blur p-3">
      <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/80 focus-within:border-brand-500/60 focus-within:shadow-glow transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isGenerating ? "正在生成中..." : "粘贴文本，开始生成信息图（Enter 发送，Shift+Enter 换行）"}
          disabled={isGenerating}
          rows={1}
          className="w-full resize-none bg-transparent px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none scroll-thin disabled:opacity-60"
          style={{ maxHeight: 160 }}
        />
        <div className="flex items-center justify-between px-2.5 pb-2">
          <span className="text-[10px] text-zinc-600">{text.length} 字符</span>
          {isGenerating ? (
            <button onClick={onStop} className="flex items-center gap-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 px-3 py-1.5 text-xs text-red-300 transition-colors">
              <Square className="w-3 h-3 fill-current" />
              停止
            </button>
          ) : (
            <button onClick={handleSend} disabled={!text.trim()} className="flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed px-3 py-1.5 text-xs text-white font-medium transition-colors">
              <Send className="w-3 h-3" />
              发送
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
