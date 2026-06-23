import { create } from "zustand";
import type { AppConfig, Conversation, Message, DesignDoc, AgentStatus, ToolCall, Task, RequestLog, SelectedElementInfo } from "@/types";

const CONFIG_KEY = "textviz:config";
const LAYOUT_KEY = "textviz:layout";

const DEFAULT_CONFIG: AppConfig = {
  baseUrl: "https://api.siliconflow.cn/v1",
  apiKey: "",
  model: "MiniMax/MiniMax-M3",
  maxTokens: 4096,
  maxTurn: 5,
  vlmBaseUrl: "https://api.siliconflow.cn/v1",
  vlmApiKey: "",
  vlmModel: "MiniMax/MiniMax-M3",
};

const DEFAULT_LAYOUT = { leftPanelWidth: 360 };

function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_CONFIG;
}

function loadLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (raw) return { ...DEFAULT_LAYOUT, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_LAYOUT;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface StoreState {
  config: AppConfig;
  setConfig: (patch: Partial<AppConfig>) => void;
  leftPanelWidth: number;
  setLeftPanelWidth: (w: number) => void;
  conversation: Conversation;
  newConversation: () => void;
  addMessage: (msg: Omit<Message, "id" | "createdAt">) => string;
  updateMessage: (id: string, patch: Partial<Message>) => void;
  appendToMessage: (id: string, text: string) => void;
  addToolCallToMessage: (messageId: string, toolCall: ToolCall) => void;
  updateToolCall: (messageId: string, toolCallId: string, patch: Partial<ToolCall>) => void;
  designDoc: DesignDoc | null;
  setDesignDoc: (doc: DesignDoc | null) => void;
  agentStatus: AgentStatus;
  setAgentStatus: (s: AgentStatus) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  configOpen: boolean;
  setConfigOpen: (v: boolean) => void;
  previewHtml: string;
  setPreviewHtml: (html: string) => void;
  previewZoom: number;
  setPreviewZoom: (z: number) => void;
  // Task 管理
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  addTasks: (tasks: Task[]) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  clearTasks: () => void;
  // 请求日志
  requestLogs: RequestLog[];
  addRequestLog: (log: RequestLog) => void;
  clearRequestLogs: () => void;
  logPanelOpen: boolean;
  setLogPanelOpen: (v: boolean) => void;
  // 写代码进度
  writingProgress: { sectionId: string; chars: number; total: number | null } | null;
  setWritingProgress: (p: { sectionId: string; chars: number; total: number | null } | null) => void;
  // 预览编辑器
  selectedElement: SelectedElementInfo | null;
  setSelectedElement: (el: SelectedElementInfo | null) => void;
  editPanelOpen: boolean;
  setEditPanelOpen: (v: boolean) => void;
}

function createEmptyConversation(): Conversation {
  return {
    id: uid(),
    title: "新对话",
    messages: [],
    designDoc: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export const useStore = create<StoreState>((set, get) => ({
  config: loadConfig(),
  setConfig: (patch) => {
    const next = { ...get().config, ...patch };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
    set({ config: next });
  },
  leftPanelWidth: loadLayout().leftPanelWidth,
  setLeftPanelWidth: (w) => {
    const clamped = Math.max(280, Math.min(720, w));
    localStorage.setItem(LAYOUT_KEY, JSON.stringify({ leftPanelWidth: clamped }));
    set({ leftPanelWidth: clamped });
  },
  conversation: createEmptyConversation(),
  newConversation: () => set({ conversation: createEmptyConversation(), designDoc: null, previewHtml: "", tasks: [], selectedElement: null, editPanelOpen: false, agentStatus: "idle" }),
  addMessage: (msg) => {
    const id = uid();
    const full: Message = { ...msg, id, createdAt: Date.now() };
    set((s) => ({
      conversation: {
        ...s.conversation,
        messages: [...s.conversation.messages, full],
        updatedAt: Date.now(),
      },
    }));
    return id;
  },
  updateMessage: (id, patch) =>
    set((s) => ({
      conversation: {
        ...s.conversation,
        messages: s.conversation.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      },
    })),
  appendToMessage: (id, text) =>
    set((s) => ({
      conversation: {
        ...s.conversation,
        messages: s.conversation.messages.map((m) =>
          m.id === id ? { ...m, content: m.content + text } : m
        ),
      },
    })),
  addToolCallToMessage: (messageId, toolCall) =>
    set((s) => ({
      conversation: {
        ...s.conversation,
        messages: s.conversation.messages.map((m) =>
          m.id === messageId
            ? { ...m, toolCalls: [...(m.toolCalls || []), toolCall] }
            : m
        ),
      },
    })),
  updateToolCall: (messageId, toolCallId, patch) =>
    set((s) => ({
      conversation: {
        ...s.conversation,
        messages: s.conversation.messages.map((m) =>
          m.id === messageId
            ? {
                ...m,
                toolCalls: (m.toolCalls || []).map((tc) =>
                  tc.id === toolCallId ? { ...tc, ...patch } : tc
                ),
              }
            : m
        ),
      },
    })),
  designDoc: null,
  setDesignDoc: (doc) => set({ designDoc: doc }),
  agentStatus: "idle",
  setAgentStatus: (s) => set({ agentStatus: s }),
  isGenerating: false,
  setIsGenerating: (v) => set({ isGenerating: v }),
  configOpen: false,
  setConfigOpen: (v) => set({ configOpen: v }),
  previewHtml: "",
  setPreviewHtml: (html) => set({ previewHtml: html }),
  previewZoom: 1,
  setPreviewZoom: (z) => set({ previewZoom: z }),
  // Task 管理
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  addTasks: (tasks) => set((s) => ({ tasks: [...s.tasks, ...tasks] })),
  updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  clearTasks: () => set({ tasks: [] }),
  // 请求日志
  requestLogs: [],
  addRequestLog: (log) => set((s) => ({ requestLogs: [...s.requestLogs.slice(-99), log] })),
  clearRequestLogs: () => set({ requestLogs: [] }),
  logPanelOpen: false,
  setLogPanelOpen: (v) => set({ logPanelOpen: v }),
  // 写代码进度
  writingProgress: null,
  setWritingProgress: (p) => set({ writingProgress: p }),
  // 预览编辑器
  selectedElement: null,
  setSelectedElement: (el) => set({ selectedElement: el, editPanelOpen: !!el }),
  editPanelOpen: false,
  setEditPanelOpen: (v) => set({ editPanelOpen: v }),
}));
