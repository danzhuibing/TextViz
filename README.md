# TextViz

> 粘贴一段文本，AI 自动生成一张精美信息图。

TextViz 是一款网页版 AI 制图工具，用户粘贴文本后，AI 通过 ReAct 循环自动生成 self-contained 的 HTML 信息图，前端实时渲染，可下载、可分享、可二次编辑。

## 功能特性

- **文本一键变信息图**：粘贴文字内容，AI 自动设计布局、配色、生成 HTML/CSS
- **ReAct Agent 循环**：plan_design → write_section → render_and_review → edit_section，自动迭代优化
- **VLM 视觉评审**：生成过程中用视觉大模型截图审查，自动修正配色、字号、布局问题
- **实时预览**：iframe 沙箱渲染，支持缩放、全屏、下载 HTML
- **流式输出**：AI 思考过程实时展示，含工具调用卡片
- **零后端**：纯前端 SPA，API key 只存浏览器 localStorage，不上传任何服务器

## 技术栈

- **框架**：React 18 + TypeScript + Vite
- **样式**：Tailwind CSS
- **状态**：Zustand
- **路由**：React Router v7
- **Markdown**：react-markdown + remark-gfm
- **图标**：lucide-react
- **截图**：html2canvas

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

构建产物在 `dist/` 目录，是纯静态文件，可部署到任意静态托管平台。

## 使用方法

1. 打开 TextViz，点击右上角齿轮配置按钮
2. 填入 LLM 和 VLM 的 Base URL、API Key、Model 名称（兼容 OpenAI 接口格式）
3. 在左侧输入框粘贴一段文本，按 Enter 发送
4. AI 自动进入 ReAct 循环，右侧画布实时展示生成过程
5. 生成完成后可下载 HTML、全屏预览或继续对话修改

> API key 仅保存在浏览器 localStorage 中，不会上传到任何服务器。

## 部署

TextViz 是纯静态 SPA，支持部署到任意静态托管平台：

- **腾讯云 EdgeOne Makers**：`edgeone makers deploy -n textviz`
- **Vercel**：`vercel --prod`
- **Cloudflare Pages**：`wrangler pages deploy dist`
- **Netlify**：`netlify deploy --prod --dir=dist`
- **GitHub Pages**：将 `dist/` 推到 `gh-pages` 分支

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── ChatPanel.tsx       # 聊天面板
│   ├── ChatInput.tsx       # 输入框
│   ├── PreviewCanvas.tsx   # 预览画布
│   ├── ConfigModal.tsx     # 配置弹窗
│   ├── MessageBubble.tsx   # 消息气泡
│   ├── ToolCallCard.tsx    # 工具调用卡片
│   ├── Divider.tsx         # 可拖动分割线
│   └── OctopusLogo.tsx     # 章鱼 logo
├── lib/                 # 核心逻辑
│   ├── agent.ts            # ReAct Agent 循环
│   ├── llm.ts              # LLM 调用
│   ├── vlm.ts              # VLM 调用
│   ├── tools.ts            # 工具定义
│   └── utils.ts            # 工具函数
├── pages/               # 页面
│   └── Workspace.tsx       # 主工作台
├── store/               # 状态
│   └── useStore.ts         # Zustand store
└── types/               # 类型
    └── index.ts
```

## License

[MIT](./LICENSE)
