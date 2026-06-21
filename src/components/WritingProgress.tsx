import { Code2 } from "lucide-react";
import { useStore } from "@/store/useStore";

/** 写代码进度条 — 展示模型正在生成多少字符的 HTML */
export function WritingProgress() {
  const progress = useStore((s) => s.writingProgress);
  if (!progress) return null;

  const { sectionId, chars } = progress;

  return (
    <div className="rounded-lg border border-brand-500/30 bg-brand-950/40 px-2.5 py-2 flex items-center gap-2">
      <Code2 className="w-3.5 h-3.5 text-brand-400 animate-pulse-soft shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-brand-200">正在生成 section {sectionId} 的 HTML 代码</span>
          <span className="text-[10px] text-brand-400 font-mono shrink-0">{chars.toLocaleString()} 字符</span>
        </div>
        {/* 进度条动画 */}
        <div className="mt-1 h-0.5 bg-brand-900/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, (chars / 2000) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
