<div align="center">

# TextViz

**Paste text. Get a beautiful infographic. Powered by AI.**

English | [中文](./docs/cn/README_CN.md) | [Deutsch](./docs/de/README_DE.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff)](https://vitejs.dev/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-22c55e)](https://danzhuibing.github.io/TextViz/)

</div>

TextViz is a web-based AI infographic generator. Paste any text — a paper abstract, a technical proposal, a product pitch — and an AI agent designs and renders a self-contained HTML infographic in real time. Download it, share it, or click any element to edit it inline.

> **100% client-side.** Your API key never leaves the browser. No backend, no server, no tracking.

---

## Table of Contents

- [Examples](#examples)
- [Features](#features)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [FAQ](#faq)
- [License](#license)

---

## Examples

TextViz ships with three carefully crafted examples that showcase different visual styles and content types. Click any example on the welcome screen to load it instantly.

### 1. Paper Figure — Transformer Architecture

A publication-quality figure of the Transformer model, drawn in the style of *Attention Is All You Need* (Vaswani et al., 2017).

- **Style**: White background, serif typography, academic figure layout
- **SVG diagrams**: Main Encoder–Decoder architecture, Scaled Dot-Product Attention, Multi-Head Attention
- **Details**: Residual connections (dashed arcs), ×N=6 layer brackets, K/V cross-attention arrows, parameter annotations (d_model=512, h=8, d_ff=2048), and the three core equations

<p align="center"><em>Input: a plain-text description of the Transformer architecture → Output: a paper-style figure with three linked SVG diagrams.</em></p>

### 2. Technical Proposal — DeepFM Recommendation System

A business-style technical proposal infographic for a recommendation system, covering data, features, model, loss, and AB-test results.

- **Style**: Light business theme, card grid layout, indigo accent
- **SVG diagrams**: DeepFM architecture (Wide + Deep), feature interaction (FM 1st/2nd order vs DNN high-order), data pipeline flow, multi-task loss structure, AB-test bar chart
- **Details**: 820M samples / 45M users / 3.2M items stats, BCE + Weighted MSE multi-task loss, +4.8% CTR / +6.1% duration lift

<p align="center"><em>Input: a structured technical proposal → Output: a five-card infographic with five SVG diagrams.</em></p>

### 3. Sketch Poster — Claude Code Product Introduction

A hand-drawn, doodle-style product poster introducing Claude Code, Anthropic's terminal AI coding assistant.

- **Style**: Hand-drawn fonts (Caveat / Patrick Hand), paper texture, rotated cards, doodle decorations
- **SVG diagrams**: Hand-drawn icons (terminal, brain, pencil, rocket, folder, lock), AI coding workflow, decorative title underline
- **Details**: 6 core features, 4 usage scenarios, "SHIP FAST!" stamp, terminal mockup

<p align="center"><em>Input: a product feature list → Output: a fun hand-drawn poster with custom SVG illustrations.</em></p>

---

## Features

- **Text → Infographic in one step** — Paste text, the AI designs layout, color, and generates HTML/CSS automatically
- **ReAct Agent loop** — `plan_design` → `add_tasks` → `write_section` → `render_and_review`, iterates until the result passes visual review
- **VLM visual review** — A vision-language model screenshots the render and checks color, font size, and layout issues
- **Inline editing** — Click any element on the preview canvas to edit its text, styles, position, or size; drag to move; resize handles; delete with one click
- **SVG replacement** — Click any SVG to upload an image and replace it
- **Real-time streaming** — Watch the AI think, plan, and write code in real time
- **Export & share** — Download the self-contained HTML, zoom, fullscreen, or keep chatting to refine
- **Zero backend** — Pure static SPA. API key stored only in browser `localStorage`

---

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  User text  │ ──▶ │  plan_design │ ──▶ │  add_tasks  │ ──▶ │ write_section│
└─────────────┘     └──────────────┘     └─────────────┘     └──────┬───────┘
                                                                    │
                        ┌───────────────────────────────────────────┘
                        ▼
              ┌──────────────────┐    no    ┌─────────────┐
              │ render_and_review│ ───────▶ │  edit_section │ ──▶ loop
              └────────┬─────────┘         └─────────────┘
                       │ yes
                       ▼
                ┌─────────────┐
                │   Done ✓    │
                └─────────────┘
```

1. **plan_design** — The LLM analyzes the input text and produces a design document (title, theme, sections, visual types)
2. **add_tasks** — A task list is generated and shown in the UI
3. **write_section** — The LLM writes HTML for each section, streamed live into the preview iframe
4. **render_and_review** — html2canvas takes a screenshot, the VLM reviews it, and if issues are found, `edit_section` is called to fix them
5. The final HTML is a single self-contained file you can download and open anywhere

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/danzhuibing/TextViz.git
cd TextViz

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open the URL shown in your terminal (typically `http://localhost:5173`).

### Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

The `dist/` folder is pure static HTML/JS/CSS — deploy it anywhere.

---

## Usage

1. Open TextViz and click the **gear icon** (top right) to configure
2. Fill in the **LLM** and **VLM** endpoints, API keys, and model names (OpenAI-compatible format)
3. Paste any text in the left input box and press **Enter**
4. Watch the AI agent plan, write, and review in real time on the right canvas
5. When done, **download the HTML**, go fullscreen, or click any element to edit it inline

> **Privacy**: Your API key is stored only in `localStorage` and is never sent to any server other than the LLM/VLM provider you configured.

### Recommended models

- **LLM** (text generation): `MiniMax/MiniMax-M3` (default) or stronger; Claude/GPT/Gemini all work
- **VLM** (visual review): `MiniMax/MiniMax-M3` or any vision-capable model

---

## Deployment

TextViz is a static SPA — deploy `dist/` to any static host:

| Platform | Command |
|----------|---------|
| **GitHub Pages** | Push `dist/` to `gh-pages` branch (a GitHub Action is included in `.github/workflows/deploy.yml`) |
| **Vercel** | `vercel --prod` |
| **Cloudflare Pages** | `wrangler pages deploy dist` |
| **Netlify** | `netlify deploy --prod --dir=dist` |
| **Tencent EdgeOne** | `edgeone makers deploy -n textviz` |

### GitHub Pages (automatic)

This repo includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages on every push to `main`. Just enable Pages in your repo settings → Pages → Source: GitHub Actions.

**Live demo**: <https://danzhuibing.github.io/TextViz/>

---

## Project Structure

```
src/
├── components/           # UI components
│   ├── ChatPanel.tsx        # Chat panel (left)
│   ├── ChatInput.tsx        # Input box
│   ├── PreviewCanvas.tsx    # Preview canvas (right, with inline editor)
│   ├── EditPanel.tsx        # Inline element editor
│   ├── ConfigModal.tsx      # Settings modal
│   ├── MessageBubble.tsx    # Chat message bubble
│   ├── ToolCallCard.tsx     # Tool-call card
│   ├── TaskList.tsx         # Task list
│   ├── RequestLogPanel.tsx  # Request log panel
│   ├── WritingProgress.tsx  # Writing progress indicator
│   ├── Divider.tsx          # Resizable divider
│   └── OctopusLogo.tsx      # Logo
├── lib/                  # Core logic
│   ├── agent.ts             # ReAct agent loop
│   ├── llm.ts               # LLM client
│   ├── vlm.ts               # VLM client
│   ├── tools.ts             # Tool definitions
│   ├── editorRuntime.ts     # Inline editor runtime (injected into iframe)
│   ├── examples.ts          # Built-in examples
│   ├── requestLog.ts        # Request logging
│   └── utils.ts             # Utilities
├── pages/
│   └── Workspace.tsx        # Main workspace
├── store/
│   └── useStore.ts          # Zustand store
└── types/
    └── index.ts             # TypeScript types
```

---

## FAQ

**Q: Do I need a backend?**
No. TextViz is 100% client-side. The only network calls go directly from your browser to the LLM/VLM API you configure.

**Q: Where is my API key stored?**
In your browser's `localStorage`. It never leaves your machine except when calling the LLM/VLM provider.

**Q: What LLM/VLM providers are supported?**
Any provider with an OpenAI-compatible API. This includes OpenAI, Anthropic (via compatible proxy), SiliconFlow, DeepSeek, Ollama, vLLM, and more.

**Q: Can I edit the generated infographic?**
Yes. Click any element on the preview canvas to open the edit panel. You can modify text, HTML, colors, fonts, spacing, position, size, and more. SVG elements can be replaced with uploaded images.

**Q: Can I use this offline?**
The app shell works offline once loaded, but AI generation requires an LLM/VLM API call. You can run a local model via Ollama for fully offline generation.

---

## License

[MIT](./LICENSE)

---

<div align="center">

If TextViz is useful to you, please consider giving it a ⭐ — it helps others discover the project.

</div>
