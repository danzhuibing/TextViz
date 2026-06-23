<div align="center">

# TextViz

**粘贴文本，AI 自动生成精美信息图。**

[English](../../README.md) | 中文 | [Deutsch](../de/README_DE.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff)](https://vitejs.dev/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-22c55e)](https://danzhuibing.github.io/TextViz/)

</div>

TextViz 是一款网页版 AI 信息图生成工具。粘贴任意文本——论文摘要、技术方案、产品介绍——AI Agent 会自动设计布局、配色，实时渲染成一张 self-contained 的 HTML 信息图。可下载、可分享、可点击任意元素二次编辑。

> **100% 纯前端。** API Key 只存浏览器，不上传任何服务器，零后端、零追踪。

---

## 目录

- [示例](#示例)
- [功能特性](#功能特性)
- [工作原理](#工作原理)
- [快速开始](#快速开始)
- [使用方法](#使用方法)
- [部署](#部署)
- [项目结构](#项目结构)
- [常见问题](#常见问题)
- [License](#license)

---

## 示例

TextViz 内置三个精心设计的示例，展示不同的视觉风格和内容类型。在欢迎界面点击任意示例即可一键加载。

### 1. 论文 Figure — Transformer 架构

一张论文级别的 Transformer 模型架构图，仿照 *Attention Is All You Need* (Vaswani et al., 2017) 的风格绘制。

- **风格**：白底、衬线字体、学术 figure 布局
- **SVG 图表**：主架构图（Encoder-Decoder）、Scaled Dot-Product Attention、Multi-Head Attention
- **细节**：残差连接（虚线弧）、×N=6 层括号、K/V 跨注意力箭头、参数标注（d_model=512, h=8, d_ff=2048）、三个核心公式

<p align="center"><em>输入：一段 Transformer 架构的纯文本描述 → 输出：论文风格的 figure，含三张关联 SVG 图。</em></p>

### 2. 技术方案 — DeepFM 推荐系统

一张商务风格的技术方案信息图，涵盖数据、特征、模型、损失、AB 实验五个模块。

- **风格**：浅色商务风、卡片网格布局、靛蓝主色
- **SVG 图表**：DeepFM 架构图（Wide + Deep）、特征交互图（FM 一阶/二阶 vs DNN 高阶）、数据流水线、多任务损失结构、AB 实验柱状图
- **细节**：8.2 亿样本 / 4500 万用户 / 320 万商品、BCE + Weighted MSE 多任务损失、CTR +4.8% / 停留时长 +6.1%

<p align="center"><em>输入：一份结构化的技术方案 → 输出：五卡片信息图，含五张 SVG 图表。</em></p>

### 3. 简笔画海报 — Claude Code 产品介绍

一张手绘涂鸦风格的产品海报，介绍 Anthropic 的终端 AI 编程助手 Claude Code。

- **风格**：手写字体（Caveat / Patrick Hand）、纸质纹理、卡片轻微旋转、涂鸦装饰
- **SVG 图表**：手绘图标（终端、大脑、铅笔、火箭、文件夹、锁）、AI 编码工作流、标题装饰下划线
- **细节**：6 个核心功能、4 个适用场景、"SHIP FAST!" 印章、终端窗口模拟

<p align="center"><em>输入：一份产品功能列表 → 输出：一张有趣的手绘海报，含自定义 SVG 插图。</em></p>

---

## 功能特性

- **文本一键变信息图** — 粘贴文字，AI 自动设计布局、配色、生成 HTML/CSS
- **ReAct Agent 循环** — `plan_design` → `add_tasks` → `write_section` → `render_and_review`，自动迭代直到通过视觉评审
- **VLM 视觉评审** — 视觉大模型截图审查配色、字号、布局问题，自动修正
- **内联编辑** — 点击预览画布上任意元素，可编辑文本、样式、位置、大小；拖拽移动；缩放手柄；一键删除
- **SVG 替换** — 点击任意 SVG 可上传图片替代
- **实时流式输出** — AI 思考、规划、写代码过程实时展示
- **导出分享** — 下载 self-contained HTML、缩放、全屏，或继续对话微调
- **零后端** — 纯静态 SPA，API Key 只存浏览器 `localStorage`

---

## 工作原理

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  用户文本   │ ──▶ │  plan_design │ ──▶ │  add_tasks  │ ──▶ │ write_section│
└─────────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
                                                                    │
                        ┌───────────────────────────────────────────┘
                        ▼
              ┌──────────────────┐    不通过   ┌─────────────┐
              │ render_and_review│ ──────────▶ │  edit_section │ ──▶ 循环
              └────────┬─────────┘            └─────────────┘
                       │ 通过
                       ▼
                ┌─────────────┐
                │   完成 ✓    │
                └─────────────┘
```

1. **plan_design** — LLM 分析输入文本，生成设计文档（标题、主题、分区、视觉类型）
2. **add_tasks** — 生成任务列表并在 UI 展示
3. **write_section** — LLM 为每个分区生成 HTML，实时流式渲染到预览 iframe
4. **render_and_review** — html2canvas 截图，VLM 评审，发现问题则调用 `edit_section` 修正
5. 最终 HTML 是一个独立的单文件，可下载后在任意环境打开

---

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/danzhuibing/TextViz.git
cd TextViz

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

在浏览器打开终端显示的地址（通常是 `http://localhost:5173`）。

### 生产构建

```bash
npm run build      # 产物输出到 dist/
npm run preview    # 本地预览生产构建
```

`dist/` 目录是纯静态 HTML/JS/CSS，可部署到任意静态托管平台。

---

## 使用方法

1. 打开 TextViz，点击右上角**齿轮图标**配置
2. 填入 **LLM** 和 **VLM** 的 Base URL、API Key、模型名称（兼容 OpenAI 接口格式）
3. 在左侧输入框粘贴任意文本，按 **Enter** 发送
4. 右侧画布实时展示 AI 的规划、编写、评审过程
5. 完成后可**下载 HTML**、全屏预览，或点击任意元素内联编辑

> **隐私**：API Key 仅保存在 `localStorage`，除调用你配置的 LLM/VLM 服务外不会发送到任何服务器。

### 推荐模型

- **LLM**（文本生成）：`Qwen/Qwen2.5-7B-Instruct` 或更强；Claude / GPT / Gemini 均可
- **VLM**（视觉评审）：`Qwen/Qwen2.5-VL-7B-Instruct` 或任意视觉模型

---

## 部署

TextViz 是纯静态 SPA，`dist/` 可部署到任意静态托管平台：

| 平台 | 命令 |
|------|------|
| **GitHub Pages** | 推送 `dist/` 到 `gh-pages` 分支（仓库已含 GitHub Action `.github/workflows/deploy.yml`） |
| **Vercel** | `vercel --prod` |
| **Cloudflare Pages** | `wrangler pages deploy dist` |
| **Netlify** | `netlify deploy --prod --dir=dist` |
| **腾讯云 EdgeOne** | `edgeone makers deploy -n textviz` |

### GitHub Pages（自动部署）

仓库已配置 GitHub Actions，每次推送到 `main` 分支会自动构建并部署到 GitHub Pages。只需在仓库 Settings → Pages → Source 选择 GitHub Actions。

**在线 Demo**：<https://danzhuibing.github.io/TextViz/>

---

## 项目结构

```
src/
├── components/           # UI 组件
│   ├── ChatPanel.tsx        # 聊天面板（左）
│   ├── ChatInput.tsx        # 输入框
│   ├── PreviewCanvas.tsx    # 预览画布（右，含内联编辑器）
│   ├── EditPanel.tsx        # 元素编辑面板
│   ├── ConfigModal.tsx      # 配置弹窗
│   ├── MessageBubble.tsx    # 消息气泡
│   ├── ToolCallCard.tsx     # 工具调用卡片
│   ├── TaskList.tsx         # 任务列表
│   ├── RequestLogPanel.tsx  # 请求日志面板
│   ├── WritingProgress.tsx  # 写代码进度
│   ├── Divider.tsx          # 可拖动分割线
│   └── OctopusLogo.tsx      # Logo
├── lib/                  # 核心逻辑
│   ├── agent.ts             # ReAct Agent 循环
│   ├── llm.ts               # LLM 客户端
│   ├── vlm.ts               # VLM 客户端
│   ├── tools.ts             # 工具定义
│   ├── editorRuntime.ts     # 内联编辑器运行时（注入 iframe）
│   ├── examples.ts          # 内置示例
│   ├── requestLog.ts        # 请求日志
│   └── utils.ts             # 工具函数
├── pages/
│   └── Workspace.tsx        # 主工作台
├── store/
│   └── useStore.ts          # Zustand store
└── types/
    └── index.ts             # TypeScript 类型
```

---

## 常见问题

**Q：需要后端吗？**
不需要。TextViz 100% 纯前端，唯一的网络请求是你配置的 LLM/VLM API。

**Q：API Key 存在哪里？**
存在浏览器的 `localStorage`，除调用 LLM/VLM 外不会离开你的机器。

**Q：支持哪些 LLM/VLM 服务商？**
任何兼容 OpenAI 接口的服务商，包括 OpenAI、Anthropic（兼容代理）、SiliconFlow、DeepSeek、Ollama、vLLM 等。

**Q：生成的信息图可以编辑吗？**
可以。点击预览画布上任意元素打开编辑面板，可修改文本、HTML、颜色、字体、间距、位置、大小等。SVG 元素可上传图片替换。

**Q：可以离线使用吗？**
应用加载后可离线使用，但 AI 生成需要调用 LLM/VLM API。可通过 Ollama 运行本地模型实现完全离线。

---

## License

[MIT](../../LICENSE)

---

<div align="center">

如果 TextViz 对你有用，欢迎给个 ⭐ —— 帮助更多人发现这个项目。

</div>
