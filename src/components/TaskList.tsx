import { CheckCircle2, Circle, Loader2, ListTodo } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { Task } from "@/types";

export function TaskList() {
  const tasks = useStore((s) => s.tasks);

  if (tasks.length === 0) return null;

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-zinc-800/60">
        <ListTodo className="w-3.5 h-3.5 text-brand-400 shrink-0" />
        <span className="text-xs font-medium text-zinc-200">任务进度</span>
        <span className="text-[10px] text-zinc-500 ml-auto">{doneCount}/{totalCount}</span>
      </div>
      {/* 进度条 */}
      <div className="h-1 bg-zinc-800/60">
        <div
          className="h-full bg-brand-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* 任务列表 */}
      <div className="max-h-48 overflow-y-auto scroll-thin">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TaskItem({ task }: { task: Task }) {
  return (
    <div className="flex items-start gap-2 px-2.5 py-1.5 border-b border-zinc-800/30 last:border-0">
      <div className="shrink-0 mt-0.5">
        {task.status === "done" ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : task.status === "in_progress" ? (
          <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
        ) : (
          <Circle className="w-3.5 h-3.5 text-zinc-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] text-zinc-500 font-mono">{task.id}</span>
        <p className={`text-[11px] leading-snug ${task.status === "done" ? "text-zinc-500 line-through" : task.status === "in_progress" ? "text-brand-200" : "text-zinc-400"}`}>
          {task.description}
        </p>
      </div>
    </div>
  );
}
