// TextViz 类型定义

export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  maxTurn: number;
}

export interface VLMConfig {
  vlmBaseUrl: string;
  vlmApiKey: string;
  vlmModel: string;
}

export interface AppConfig extends LLMConfig, VLMConfig {}

export type Role = "system" | "user" | "assistant" | "tool";

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
  result?: string;
  status: "pending" | "running" | "done" | "error";
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  createdAt: number;
  streaming?: boolean;
}

export interface Section {
  id: string;
  name: string;
  layout: string;
  content: string;
  visualType: string;
  html: string;
}

export interface DesignDoc {
  title: string;
  theme: string;
  sections: Section[];
  fullHtml: string;
  version: number;
}

export interface ReviewIssue {
  section: string;
  severity: "high" | "medium" | "low";
  description: string;
  suggestion: string;
}

export interface ReviewResult {
  pass: boolean;
  score: number;
  issues: ReviewIssue[];
  summary: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  designDoc: DesignDoc | null;
  createdAt: number;
  updatedAt: number;
}

export type AgentStatus = "idle" | "thinking" | "calling_tool" | "rendering" | "reviewing" | "writing" | "done" | "error";

// ===== Task 管理 =====
export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
  id: string;
  description: string;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
}

// ===== 预览编辑器 =====
export interface SelectedElementInfo {
  tagName: string;
  textContent: string;
  outerHTML: string;
  isSVG: boolean;
  styles: {
    position: string;
    left: string;
    top: string;
    width: string;
    height: string;
    color: string;
    backgroundColor: string;
    fontSize: string;
    fontWeight: string;
    textAlign: string;
    margin: string;
    padding: string;
    border: string;
    borderRadius: string;
    display: string;
    opacity: string;
    lineHeight: string;
    fontFamily: string;
  };
  rect: { left: number; top: number; width: number; height: number };
}

// ===== 请求日志 =====
export type RequestLogType = "llm" | "vlm";

export interface RequestLog {
  id: string;
  timestamp: number;
  type: RequestLogType;
  url: string;
  method: string;
  headers: Record<string, string>;
  requestBody: unknown;
  status: number | null;
  responseBody: string | null;
  duration: number | null;
  error?: string;
}
