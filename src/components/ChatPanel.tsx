import { useEffect, useRef } from "react";
import { Settings, Plus, Sparkles, Terminal, FileText, Play } from "lucide-react";
import { useStore } from "@/store/useStore";
import { OctopusLogo } from "./OctopusLogo";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { TaskList } from "./TaskList";
import { WritingProgress } from "./WritingProgress";
import type { AgentCallbacks } from "@/lib/agent";
import { runAgent } from "@/lib/agent";
import { EXAMPLES, type Example } from "@/lib/examples";

interface ChatPanelProps {
  takeScreenshot: () => Promise<string | null>;
}

const STATUS_LABELS: Record<string, string> = {
  idle: "", thinking: "思考中", calling_tool: "调用工具", rendering: "渲染中", reviewing: "评审中", writing: "生成代码", done: "", error: "出错",
};

export function ChatPanel({ takeScreenshot }: ChatPanelProps) {
  const conversation = useStore((s) => s.conversation);
  const config = useStore((s) => s.config);
  const agentStatus = useStore((s) => s.agentStatus);
  const isGenerating = useStore((s) => s.isGenerating);
  const setConfigOpen = useStore((s) => s.setConfigOpen);
  const newConversation = useStore((s) => s.newConversation);
  const addMessage = useStore((s) => s.addMessage);
  const updateMessage = useStore((s) => s.updateMessage);
  const appendToMessage = useStore((s) => s.appendToMessage);
  const addToolCallToMessage = useStore((s) => s.addToolCallToMessage);
  const updateToolCall = useStore((s) => s.updateToolCall);
  const setDesignDoc = useStore((s) => s.setDesignDoc);
  const setPreviewHtml = useStore((s) => s.setPreviewHtml);
  const setAgentStatus = useStore((s) => s.setAgentStatus);
  const setIsGenerating = useStore((s) => s.setIsGenerating);
  const tasks = useStore((s) => s.tasks);
  const setTasks = useStore((s) => s.setTasks);
  const addTasks = useStore((s) => s.addTasks);
  const updateTask = useStore((s) => s.updateTask);
  const clearTasks = useStore((s) => s.clearTasks);
  const setWritingProgress = useStore((s) => s.setWritingProgress);
  const setLogPanelOpen = useStore((s) => s.setLogPanelOpen);
  const requestLogs = useStore((s) => s.requestLogs);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const userRequestRef = useRef<string>("");

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [conversation.messages, tasks]);

  const handleSend = async (text: string) => {
    if (isGenerating) return;
    if (!config.apiKey) { setConfigOpen(true); return; }
    userRequestRef.current = text;
    addMessage({ role: "user", content: text });
    clearTasks();
    setIsGenerating(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const callbacks: AgentCallbacks = {
      getConfig: () => useStore.getState().config,
      getDesignDoc: () => useStore.getState().designDoc,
      setDesignDoc, setPreviewHtml, setAgentStatus,
      addMessage, updateMessage, appendToMessage,
      addToolCall: (messageId, tc) => addToolCallToMessage(messageId, { id: tc.id, name: tc.name, arguments: tc.arguments, status: tc.status }),
      updateToolCall, takeScreenshot,
      getUserRequest: () => userRequestRef.current,
      getTasks: () => useStore.getState().tasks,
      setTasks, addTasks, updateTask, clearTasks,
      setWritingProgress,
    };

    try {
      await runAgent(text, callbacks, controller.signal);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg !== "已停止") addMessage({ role: "assistant", content: `**生成失败**：${msg}` });
      setAgentStatus("error");
    } finally {
      setIsGenerating(false);
      setWritingProgress(null);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
  };

  const loadExample = (example: Example) => {
    if (isGenerating) return;
    // 清空当前对话
    newConversation();
    // 依次添加示例消息
    for (const msg of example.messages) {
      addMessage({ role: msg.role, content: msg.content, toolCalls: msg.toolCalls });
    }
    // 设置任务列表
    setTasks(example.tasks.map((t, i) => ({ ...t, id: `ex-${example.id}-${i}`, createdAt: Date.now() + i, completedAt: Date.now() + i })));
    // 设置预览 HTML
    setPreviewHtml(example.html);
    // 设置状态
    setAgentStatus("done");
  };

  const statusLabel = STATUS_LABELS[agentStatus] || "";

  return (
    <div className="flex flex-col h-full bg-zinc-950/80">
      <div className="shrink-0 h-14 flex items-center justify-between px-3 border-b border-zinc-800/80 bg-gradient-to-r from-brand-950/60 to-zinc-950">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-brand-900/40 border border-brand-500/30 flex items-center justify-center shadow-glow">
            <OctopusLogo size={26} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold text-white tracking-tight">TextViz</h1>
              <Sparkles className="w-3 h-3 text-brand-400" />
            </div>
            <p className="text-[10px] text-zinc-500 truncate">AI 文本可视化工具</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLogPanelOpen(!useStore.getState().logPanelOpen)}
            title="请求日志"
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <Terminal className="w-4 h-4" />
            {requestLogs.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-brand-500 text-[8px] text-white flex items-center justify-center font-bold">
                {requestLogs.length > 99 ? "99+" : requestLogs.length}
              </span>
            )}
          </button>
          <button onClick={newConversation} disabled={isGenerating} title="新对话" className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => setConfigOpen(true)} title="配置" className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {statusLabel && (
        <div className="shrink-0 px-3 py-1.5 bg-brand-950/40 border-b border-brand-500/20 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-soft" />
          <span className="text-[11px] text-brand-300">{statusLabel}...</span>
        </div>
      )}

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-thin p-3 space-y-3">
        {conversation.messages.length === 0 && <EmptyState onLoadExample={loadExample} />}
        {conversation.messages.filter((m) => m.role !== "tool").map((m) => (<MessageBubble key={m.id} message={m} />))}
        <WritingProgress />
        <TaskList />
      </div>

      <ChatInput onSend={handleSend} onStop={handleStop} />
    </div>
  );
}

function EmptyState({ onLoadExample }: { onLoadExample: (ex: Example) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6">
      <div className="w-14 h-14 rounded-2xl bg-brand-900/40 border border-brand-500/30 flex items-center justify-center mb-3 shadow-glow">
        <OctopusLogo size={38} />
      </div>
      <h2 className="text-base font-semibold text-white mb-1">欢迎使用 TextViz</h2>
      <p className="text-xs text-zinc-400 leading-relaxed max-w-[260px] mb-5">粘贴文本，AI 自动生成信息图。或点击下方示例查看完整效果：</p>
      <div className="w-full max-w-[320px] space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-zinc-600 text-left mb-1">示例展示</div>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onLoadExample(ex)}
            className="group w-full flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-left hover:border-brand-500/40 hover:bg-zinc-900 transition-all"
          >
            <div className="shrink-0 w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg group-hover:bg-brand-900/40 group-hover:border-brand-500/30 transition-colors">
              {ex.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-200">{ex.title}</span>
                <FileText className="w-3 h-3 text-zinc-600" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{ex.description}</p>
            </div>
            <Play className="shrink-0 w-3.5 h-3.5 text-zinc-600 group-hover:text-brand-400 mt-1.5 transition-colors" />
          </button>
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 mt-4 max-w-[280px] leading-relaxed">点击示例可直接查看输入、对话过程和最终配图。也可粘贴自己的文本生成。</p>
    </div>
  );
}
