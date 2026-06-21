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

export type AgentStatus = "idle" | "thinking" | "calling_tool" | "rendering" | "reviewing" | "done" | "error";
