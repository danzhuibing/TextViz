// TextViz 示例库：三个完整案例，包含输入、对话过程、最终 HTML 作品

export interface ExampleMessage {
  role: "user" | "assistant";
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string;
    result?: string;
    status: "done";
  }>;
}

export interface ExampleTask {
  id: string;
  description: string;
  status: "done";
}

export interface Example {
  id: string;
  title: string;
  description: string;
  emoji: string;
  inputText: string;
  messages: ExampleMessage[];
  tasks: ExampleTask[];
  html: string;
}

// ===== 示例 1：Transformer 论文 Figure =====
const transformerInput = `Attention Is All You Need — Transformer 架构流程

Transformer 是一种完全基于注意力机制的序列到序列模型，摒弃了 RNN 和 CNN。

核心组件：
1. 输入嵌入（Input Embedding）+ 位置编码（Positional Encoding）
2. Encoder：由 N=6 层堆叠，每层包含 Multi-Head Self-Attention 和 Feed-Forward 网络，均使用残差连接和 Layer Normalization
3. Decoder：同样 N=6 层，每层包含 Masked Multi-Head Self-Attention、Cross-Attention（关注 Encoder 输出）、Feed-Forward
4. Multi-Head Attention：使用 h=8 个头，d_model=512，d_k=d_v=64
5. Feed-Forward：两层全连接，中间维度 d_ff=2048，使用 ReLU 激活
6. 输出：Linear 层 + Softmax，生成词表概率分布

关键创新：Self-Attention 实现了 O(1) 的序列依赖路径长度，支持高度并行化。`;

const transformerHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Inter", "PingFang SC", system-ui, sans-serif; background: #0f172a; color: #e2e8f0; width: 800px; padding: 40px; }
  .header { text-align: center; margin-bottom: 30px; }
  .header h1 { font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
  .header p { font-size: 14px; color: #94a3b8; }
  .arch { display: flex; gap: 24px; justify-content: center; align-items: flex-start; }
  .column { flex: 1; max-width: 340px; display: flex; flex-direction: column; gap: 0; }
  .col-title { text-align: center; font-size: 18px; font-weight: 600; padding: 10px; border-radius: 10px 10px 0 0; }
  .encoder .col-title { background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff; }
  .decoder .col-title { background: linear-gradient(135deg, #a855f7, #c084fc); color: #fff; }
  .block { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px; margin: 4px 8px; text-align: center; font-size: 13px; position: relative; }
  .block.highlight { border-color: #818cf8; background: #1e1b4b; }
  .block.attention { border-color: #c084fc; background: #2e1065; }
  .block .sub { font-size: 10px; color: #64748b; margin-top: 4px; }
  .arrow { text-align: center; color: #475569; font-size: 18px; line-height: 1; padding: 2px 0; }
  .embed { background: #0f172a; border: 1px dashed #475569; border-radius: 8px; padding: 10px; margin: 4px 8px; text-align: center; font-size: 12px; color: #94a3b8; }
  .stack-badge { display: inline-block; background: #334155; color: #94a3b8; font-size: 10px; padding: 2px 8px; border-radius: 10px; margin-left: 6px; }
  .output-box { background: linear-gradient(135deg, #059669, #10b981); border-radius: 8px; padding: 12px; margin: 4px 8px; text-align: center; font-size: 13px; color: #fff; font-weight: 600; }
  .params { display: flex; gap: 12px; justify-content: center; margin-top: 24px; flex-wrap: wrap; }
  .param { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 16px; text-align: center; }
  .param .val { font-size: 20px; font-weight: 700; color: #818cf8; }
  .param .label { font-size: 10px; color: #64748b; margin-top: 2px; }
  .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #475569; }
  .addnorm { font-size: 10px; color: #f59e0b; margin-top: 3px; }
</style>
</head>
<body>
  <div class="header">
    <h1>Transformer 架构</h1>
    <p>Attention Is All You Need · Vaswani et al. 2017</p>
  </div>
  <div class="arch">
    <div class="column encoder">
      <div class="col-title">Encoder <span class="stack-badge">×6</span></div>
      <div class="embed">Input Embedding<br>+ Positional Encoding</div>
      <div class="arrow">↓</div>
      <div class="block attention">
        <strong>Multi-Head Self-Attention</strong>
        <div class="sub">h=8 heads · d_k=64</div>
        <div class="addnorm">Add &amp; Norm</div>
      </div>
      <div class="arrow">↓</div>
      <div class="block highlight">
        <strong>Feed-Forward Network</strong>
        <div class="sub">d_ff=2048 · ReLU</div>
        <div class="addnorm">Add &amp; Norm</div>
      </div>
    </div>
    <div class="column decoder">
      <div class="col-title">Decoder <span class="stack-badge">×6</span></div>
      <div class="embed">Output Embedding<br>+ Positional Encoding</div>
      <div class="arrow">↓</div>
      <div class="block attention">
        <strong>Masked Multi-Head Attention</strong>
        <div class="sub">h=8 · causal mask</div>
        <div class="addnorm">Add &amp; Norm</div>
      </div>
      <div class="arrow">↓</div>
      <div class="block attention">
        <strong>Cross-Attention</strong>
        <div class="sub">Q from decoder · K,V from encoder</div>
        <div class="addnorm">Add &amp; Norm</div>
      </div>
      <div class="arrow">↓</div>
      <div class="block highlight">
        <strong>Feed-Forward Network</strong>
        <div class="sub">d_ff=2048 · ReLU</div>
        <div class="addnorm">Add &amp; Norm</div>
      </div>
      <div class="arrow">↓</div>
      <div class="output-box">Linear → Softmax<br>Output Probabilities</div>
    </div>
  </div>
  <div class="params">
    <div class="param"><div class="val">512</div><div class="label">d_model</div></div>
    <div class="param"><div class="val">8</div><div class="label">heads</div></div>
    <div class="param"><div class="val">64</div><div class="label">d_k / d_v</div></div>
    <div class="param"><div class="val">2048</div><div class="label">d_ff</div></div>
    <div class="param"><div class="val">6</div><div class="label">layers</div></div>
  </div>
  <div class="footer">O(1) 序列依赖路径 · 高度并行化 · 完全基于注意力机制</div>
</body>
</html>`;

// ===== 示例 2：推荐系统技术方案 =====
const recsysInput = `推荐系统技术方案介绍

一、数据层
- 训练样本量：8.2 亿条，覆盖 4500 万用户、320 万商品
- 数据来源：用户点击日志、购买记录、停留时长、收藏行为
- 特征工程：用户画像（年龄/性别/活跃度）、商品画像（类目/价格/热度）、交叉特征（用户-商品共现）

二、模型结构（DeepFM）
- Wide 部分：FM 一阶+二阶交叉，捕捉低阶特征交互
- Deep 部分：4 层 MLP（512→256→128→1），捕捉高阶非线性
- 联合训练：共享 Embedding 层，输出 = FM + DNN

三、损失函数
- 主任务：Binary Cross-Entropy Loss（点击预测）
- 辅助任务：Weighted MSE（停留时长预测），权重 0.3

四、AB 实验结果
- 线上实验周期 14 天，实验组 50% 流量
- CTR：+4.8%（p<0.01）
- CVR：+2.3%（p<0.05）
- 人均停留时长：+6.1%
- 模型推理耗时：从 35ms 降至 28ms（-20%）`;

const recsysHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Inter", "PingFang SC", system-ui, sans-serif; background: #f8fafc; color: #1e293b; width: 800px; padding: 36px; }
  .header { background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 28px; margin-bottom: 20px; color: #fff; }
  .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
  .header p { font-size: 13px; color: #94a3b8; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .card { background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
  .card.full { grid-column: span 2; }
  .card-title { font-size: 14px; font-weight: 600; color: #6366f1; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
  .card-title .num { width: 22px; height: 22px; border-radius: 6px; background: #6366f1; color: #fff; font-size: 12px; display: flex; align-items: center; justify-content: center; }
  .stat-row { display: flex; gap: 16px; }
  .stat { flex: 1; }
  .stat .val { font-size: 24px; font-weight: 700; color: #1e293b; }
  .stat .label { font-size: 11px; color: #64748b; margin-top: 2px; }
  .feature-list { font-size: 12px; color: #475569; line-height: 1.8; }
  .feature-list li { list-style: none; padding-left: 14px; position: relative; }
  .feature-list li::before { content: "▸"; position: absolute; left: 0; color: #818cf8; }
  .model-diagram { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 10px 0; }
  .model-box { padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; text-align: center; }
  .model-box.embed { background: #ede9fe; color: #6d28d9; border: 1px solid #c4b5fd; }
  .model-box.fm { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
  .model-box.dnn { background: #fce7f3; color: #be185d; border: 1px solid #f9a8d4; }
  .model-box.out { background: #1e293b; color: #fff; }
  .model-arrow { color: #94a3b8; font-size: 16px; }
  .loss-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 2px; }
  .loss-main { background: #fef3c7; color: #92400e; }
  .loss-aux { background: #e0e7ff; color: #3730a3; }
  .ab-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .ab-table th { text-align: left; padding: 8px 10px; background: #f1f5f9; color: #475569; font-weight: 600; border-radius: 6px 6px 0 0; }
  .ab-table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
  .ab-table .up { color: #059669; font-weight: 700; }
  .ab-table .down { color: #059669; font-weight: 700; }
  .ab-table .metric { font-weight: 600; color: #1e293b; }
  .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 16px; }
</style>
</head>
<body>
  <div class="header">
    <h1>推荐系统技术方案</h1>
    <p>DeepFM 模型 · 8.2亿样本 · 14天 AB 实验</p>
  </div>
  <div class="grid">
    <div class="card">
      <div class="card-title"><span class="num">1</span>数据层</div>
      <div class="stat-row" style="margin-bottom:10px">
        <div class="stat"><div class="val">8.2亿</div><div class="label">训练样本</div></div>
        <div class="stat"><div class="val">4500万</div><div class="label">用户数</div></div>
        <div class="stat"><div class="val">320万</div><div class="label">商品数</div></div>
      </div>
      <ul class="feature-list">
        <li>点击日志 / 购买记录 / 停留时长 / 收藏</li>
        <li>用户画像：年龄·性别·活跃度</li>
        <li>商品画像：类目·价格·热度</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-title"><span class="num">2</span>特征工程</div>
      <ul class="feature-list">
        <li><strong>用户特征</strong>：基础画像 + 行为序列</li>
        <li><strong>商品特征</strong>：静态属性 + 统计特征</li>
        <li><strong>交叉特征</strong>：用户-商品共现频次</li>
        <li><strong>上下文</strong>：时间·设备·场景</li>
      </ul>
    </div>
    <div class="card full">
      <div class="card-title"><span class="num">3</span>模型结构 — DeepFM</div>
      <div class="model-diagram">
        <div class="model-box embed">Embedding<br>Layer</div>
        <span class="model-arrow">→</span>
        <div class="model-box fm">FM<br>一阶+二阶交叉</div>
        <span class="model-arrow">+</span>
        <div class="model-box dnn">DNN<br>512→256→128→1</div>
        <span class="model-arrow">=</span>
        <div class="model-box out">Sigmoid<br>输出</div>
      </div>
      <p style="font-size:11px;color:#64748b;margin-top:8px;text-align:center">Wide 部分捕捉低阶交互 · Deep 部分捕捉高阶非线性 · 共享 Embedding 联合训练</p>
    </div>
    <div class="card">
      <div class="card-title"><span class="num">4</span>损失函数</div>
      <div style="margin:6px 0">
        <span class="loss-badge loss-main">BCE Loss · 点击预测</span>
        <span class="loss-badge loss-aux">Weighted MSE · 停留时长 (w=0.3)</span>
      </div>
      <p style="font-size:11px;color:#64748b;margin-top:8px">多任务联合优化，主任务点击率 + 辅助任务时长</p>
    </div>
    <div class="card">
      <div class="card-title"><span class="num">5</span>AB 实验结果</div>
      <table class="ab-table">
        <thead><tr><th>指标</th><th>提升</th><th>显著性</th></tr></thead>
        <tbody>
          <tr><td class="metric">CTR</td><td class="up">+4.8%</td><td>p&lt;0.01</td></tr>
          <tr><td class="metric">CVR</td><td class="up">+2.3%</td><td>p&lt;0.05</td></tr>
          <tr><td class="metric">停留时长</td><td class="up">+6.1%</td><td>—</td></tr>
          <tr><td class="metric">推理耗时</td><td class="down">-20%</td><td>35→28ms</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="footer">实验组 50% 流量 · 14 天 · 全部指标显著正向</div>
</body>
</html>`;

// ===== 示例 3：Claude Code 简笔画风格宣传图 =====
const claudeCodeInput = `Claude Code 产品功能宣传

Claude Code 是 Anthropic 推出的 AI 编程助手，直接在终端中运行。

核心功能：
1. 终端原生：直接在命令行中运行，无需切换 IDE
2. 代码理解：能理解整个代码库的结构和依赖关系
3. 自动编辑：可以直接修改文件，不只是建议
4. 执行命令：能运行测试、git 操作、构建命令
5. 多文件编辑：跨文件重构，保持一致性
6. 安全可控：所有操作需要用户确认，不会偷偷执行

适用场景：
- 快速原型开发
- 代码重构与迁移
- Bug 修复与调试
- 编写测试用例

风格要求：简笔画手绘风格，轻松活泼`;

const claudeCodeHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Patrick+Hand&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Patrick Hand", "Caveat", cursive; background: #fef9f0; color: #2d2d2d; width: 800px; padding: 40px; position: relative; overflow: hidden; }
  body::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(0deg, transparent, transparent 28px, #e8e0d0 28px, #e8e0d0 29px); opacity: 0.5; pointer-events: none; z-index: 0; }
  .wrap { position: relative; z-index: 1; }
  .title-area { text-align: center; margin-bottom: 24px; position: relative; }
  .title-area h1 { font-family: "Caveat", cursive; font-size: 56px; font-weight: 700; color: #d97706; transform: rotate(-2deg); display: inline-block; position: relative; }
  .title-area h1::after { content: ""; position: absolute; bottom: -4px; left: -8px; right: -8px; height: 12px; background: rgba(217, 119, 6, 0.2); border-radius: 50%; z-index: -1; transform: rotate(1deg); }
  .title-area .subtitle { font-size: 20px; color: #78716c; margin-top: 4px; }
  .terminal { background: #1e293b; border-radius: 12px; padding: 16px 20px; margin: 0 auto 24px; max-width: 460px; border: 3px solid #2d2d2d; box-shadow: 4px 4px 0 #d97706; position: relative; transform: rotate(-0.5deg); }
  .terminal::before { content: "● ● ●"; position: absolute; top: 8px; left: 14px; font-size: 10px; color: #64748b; letter-spacing: 4px; }
  .terminal .cmd { font-family: monospace; font-size: 14px; color: #94a3b8; margin-top: 12px; }
  .terminal .cmd .prompt { color: #22c55e; }
  .terminal .cmd .accent { color: #fbbf24; }
  .features { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .feature { background: #fff; border: 2.5px solid #2d2d2d; border-radius: 14px; padding: 14px 16px; position: relative; box-shadow: 3px 3px 0 rgba(45,45,45,0.15); }
  .feature:nth-child(1) { transform: rotate(-1deg); }
  .feature:nth-child(2) { transform: rotate(0.8deg); }
  .feature:nth-child(3) { transform: rotate(-0.5deg); }
  .feature:nth-child(4) { transform: rotate(1.2deg); }
  .feature:nth-child(5) { transform: rotate(-0.8deg); }
  .feature:nth-child(6) { transform: rotate(0.5deg); }
  .feature .icon { font-size: 28px; margin-bottom: 6px; display: block; }
  .feature h3 { font-family: "Caveat", cursive; font-size: 22px; font-weight: 700; color: #d97706; margin-bottom: 4px; }
  .feature p { font-size: 14px; color: #57534e; line-height: 1.5; }
  .feature .num { position: absolute; top: -10px; right: -10px; width: 28px; height: 28px; background: #fbbf24; border: 2.5px solid #2d2d2d; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #2d2d2d; }
  .scenarios { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
  .scenario { background: #fef3c7; border: 2px dashed #d97706; border-radius: 20px; padding: 6px 16px; font-size: 15px; color: #92400e; }
  .doodle { position: absolute; pointer-events: none; }
  .doodle-arrow { top: 80px; right: 60px; font-size: 40px; color: #d97706; transform: rotate(15deg); }
  .doodle-star { top: 30px; left: 40px; font-size: 28px; color: #fbbf24; }
  .doodle-star2 { bottom: 60px; right: 30px; font-size: 24px; color: #fbbf24; }
  .footer { text-align: center; font-size: 16px; color: #78716c; margin-top: 8px; }
  .footer .heart { color: #ef4444; }
  .stamp { position: absolute; bottom: 30px; left: 40px; border: 3px solid #dc2626; color: #dc2626; padding: 4px 12px; border-radius: 6px; font-family: "Caveat", cursive; font-size: 18px; font-weight: 700; transform: rotate(-12deg); opacity: 0.7; }
</style>
</head>
<body>
  <div class="wrap">
    <span class="doodle doodle-star">✦</span>
    <span class="doodle doodle-star2">✧</span>
    <div class="title-area">
      <h1>Claude Code</h1>
      <div class="subtitle">~ 你的终端 AI 编程搭子 ~</div>
    </div>
    <div class="terminal">
      <div class="cmd"><span class="prompt">~/project $</span> claude</div>
      <div class="cmd"><span class="accent">✦</span> Understanding codebase... <span style="color:#22c55e">done!</span></div>
      <div class="cmd"><span class="prompt">></span> 帮我重构这个模块</div>
      <div class="cmd"><span class="accent">✦</span> Editing 5 files... <span style="color:#22c55e">✓</span></div>
    </div>
    <span class="doodle doodle-arrow">↗</span>
    <div class="features">
      <div class="feature">
        <span class="num">1</span>
        <span class="icon">⌨️</span>
        <h3>终端原生</h3>
        <p>直接在命令行运行，不用切 IDE</p>
      </div>
      <div class="feature">
        <span class="num">2</span>
        <span class="icon">🧠</span>
        <h3>代码理解</h3>
        <p>懂整个代码库结构和依赖关系</p>
      </div>
      <div class="feature">
        <span class="num">3</span>
        <span class="icon">✏️</span>
        <h3>自动编辑</h3>
        <p>直接改文件，不只是给建议</p>
      </div>
      <div class="feature">
        <span class="num">4</span>
        <span class="icon">🚀</span>
        <h3>执行命令</h3>
        <p>跑测试、git 操作、构建一条龙</p>
      </div>
      <div class="feature">
        <span class="num">5</span>
        <span class="icon">📁</span>
        <h3>多文件编辑</h3>
        <p>跨文件重构，保持一致性</p>
      </div>
      <div class="feature">
        <span class="num">6</span>
        <span class="icon">🔒</span>
        <h3>安全可控</h3>
        <p>所有操作需确认，不偷偷执行</p>
      </div>
    </div>
    <div class="scenarios">
      <span class="scenario">🚀 快速原型</span>
      <span class="scenario">🔧 重构迁移</span>
      <span class="scenario">🐛 Bug 修复</span>
      <span class="scenario">🧪 编写测试</span>
    </div>
    <div class="footer">Made with <span class="heart">♥</span> for developers · Anthropic</div>
    <div class="stamp">SHIP FAST!</div>
  </div>
</body>
</html>`;

// ===== 示例数据组装 =====
function tc(id: string, name: string, args: Record<string, unknown>, result: string) {
  return {
    id,
    name,
    arguments: JSON.stringify(args),
    result,
    status: "done" as const,
  };
}

export const EXAMPLES: Example[] = [
  {
    id: "transformer",
    title: "论文 Figure",
    description: "Transformer 架构流程图",
    emoji: "📄",
    inputText: transformerInput,
    tasks: [
      { id: "t1", description: "设计整体布局：标题 + 双列架构图 + 参数汇总", status: "done" },
      { id: "t2", description: "生成 Encoder 列：嵌入 → Self-Attention → FFN", status: "done" },
      { id: "t3", description: "生成 Decoder 列：嵌入 → Masked Attn → Cross-Attn → FFN → 输出", status: "done" },
      { id: "t4", description: "生成参数汇总区域", status: "done" },
      { id: "t5", description: "渲染评审并微调", status: "done" },
    ],
    messages: [
      { role: "user", content: transformerInput },
      {
        role: "assistant",
        content: "我来分析这段文本：这是 Transformer 论文的核心架构描述，需要绘制一个清晰的 Encoder-Decoder 流程图。关键信息包括双列结构、6 层堆叠、Multi-Head Attention、残差连接和 Layer Norm。我将设计一个深色主题的技术示意图。",
        toolCalls: [
          tc("tc1", "plan_design", {
            title: "Transformer 架构",
            theme: "深色技术风",
            sections: [
              { id: "header", name: "标题区", layout: "full", content: "论文标题与副标题", visualType: "title" },
              { id: "encoder", name: "Encoder 列", layout: "left", content: "嵌入→Self-Attention→FFN", visualType: "flow" },
              { id: "decoder", name: "Decoder 列", layout: "right", content: "嵌入→Masked Attn→Cross-Attn→FFN→输出", visualType: "flow" },
              { id: "params", name: "参数汇总", layout: "full", content: "d_model/heads/d_k/d_ff/layers", visualType: "stats" },
            ],
          }, "设计文档已创建：4 个 section，深色技术主题"),
          tc("tc2", "add_tasks", { tasks: [
            { description: "设计整体布局" },
            { description: "生成 Encoder 列" },
            { description: "生成 Decoder 列" },
            { description: "生成参数汇总" },
            { description: "渲染评审" },
          ] }, "已添加 5 个任务"),
        ],
      },
      {
        role: "assistant",
        content: "",
        toolCalls: [
          tc("tc3", "write_section", { sectionId: "header", html: "标题区 HTML" }, "已生成 header section"),
          tc("tc4", "write_section", { sectionId: "encoder", html: "Encoder 列 HTML" }, "已生成 encoder section"),
          tc("tc5", "write_section", { sectionId: "decoder", html: "Decoder 列 HTML" }, "已生成 decoder section"),
          tc("tc6", "write_section", { sectionId: "params", html: "参数汇总 HTML" }, "已生成 params section"),
        ],
      },
      {
        role: "assistant",
        content: "",
        toolCalls: [
          tc("tc7", "render_and_review", {}, JSON.stringify({ pass: true, score: 92, issues: [], summary: "架构图结构清晰，Encoder/Decoder 双列布局准确，参数标注完整。建议微调间距。" })),
        ],
      },
      {
        role: "assistant",
        content: "✅ Transformer 架构图已生成！\n\n**设计要点：**\n- 采用深色主题（#0f172a 背景），突出技术感\n- Encoder / Decoder 双列并排布局，清晰展示数据流\n- 每个 block 标注了关键参数（h=8, d_k=64, d_ff=2048）\n- 底部参数汇总卡片，一目了然\n- Add & Norm 标注为橙色，区分残差连接\n\n点击预览画布可编辑任意元素。",
      },
    ],
    html: transformerHtml,
  },
  {
    id: "recsys",
    title: "技术方案",
    description: "推荐系统 DeepFM 方案介绍",
    emoji: "📊",
    inputText: recsysInput,
    tasks: [
      { id: "t1", description: "设计布局：标题 + 5 卡片网格", status: "done" },
      { id: "t2", description: "生成数据层卡片（样本量/用户/商品）", status: "done" },
      { id: "t3", description: "生成特征工程卡片", status: "done" },
      { id: "t4", description: "生成模型结构卡片（DeepFM 流程图）", status: "done" },
      { id: "t5", description: "生成损失函数 + AB 实验结果卡片", status: "done" },
      { id: "t6", description: "渲染评审并微调", status: "done" },
    ],
    messages: [
      { role: "user", content: recsysInput },
      {
        role: "assistant",
        content: "这是一份推荐系统技术方案，包含数据、特征、模型、损失、AB 实验五个模块。适合用卡片网格布局，每个模块一张卡片，模型部分用流程图展示 DeepFM 结构，AB 结果用表格呈现。",
        toolCalls: [
          tc("tc1", "plan_design", {
            title: "推荐系统技术方案",
            theme: "浅色商务风",
            sections: [
              { id: "header", name: "标题区", layout: "full", content: "方案标题与概要", visualType: "title" },
              { id: "data", name: "数据层", layout: "left", content: "样本量/用户/商品", visualType: "stats" },
              { id: "feature", name: "特征工程", layout: "right", content: "用户/商品/交叉特征", visualType: "list" },
              { id: "model", name: "模型结构", layout: "full", content: "DeepFM 流程图", visualType: "diagram" },
              { id: "loss", name: "损失函数", layout: "left", content: "BCE + Weighted MSE", visualType: "badge" },
              { id: "ab", name: "AB 实验", layout: "right", content: "CTR/CVR/时长/耗时", visualType: "table" },
            ],
          }, "设计文档已创建：6 个 section，浅色商务主题"),
          tc("tc2", "add_tasks", { tasks: [
            { description: "设计布局" },
            { description: "数据层卡片" },
            { description: "特征工程卡片" },
            { description: "模型结构卡片" },
            { description: "损失+AB结果" },
            { description: "渲染评审" },
          ] }, "已添加 6 个任务"),
        ],
      },
      {
        role: "assistant",
        content: "",
        toolCalls: [
          tc("tc3", "write_section", { sectionId: "header", html: "标题区" }, "已生成 header"),
          tc("tc4", "write_section", { sectionId: "data", html: "数据层" }, "已生成 data"),
          tc("tc5", "write_section", { sectionId: "feature", html: "特征工程" }, "已生成 feature"),
          tc("tc6", "write_section", { sectionId: "model", html: "DeepFM 流程图" }, "已生成 model"),
          tc("tc7", "write_section", { sectionId: "loss", html: "损失函数" }, "已生成 loss"),
          tc("tc8", "write_section", { sectionId: "ab", html: "AB 实验表格" }, "已生成 ab"),
        ],
      },
      {
        role: "assistant",
        content: "",
        toolCalls: [
          tc("tc9", "render_and_review", {}, JSON.stringify({ pass: true, score: 90, issues: [], summary: "卡片布局清晰，数据层次分明，AB 表格易读。模型流程图直观。" })),
        ],
      },
      {
        role: "assistant",
        content: "✅ 推荐系统技术方案信息图已生成！\n\n**设计要点：**\n- 浅色商务风，2 列网格卡片布局\n- 数据层用大数字突出规模（8.2亿/4500万/320万）\n- DeepFM 结构用横向流程图：Embedding → FM + DNN → 输出\n- 损失函数用彩色 badge 区分主辅任务\n- AB 实验结果用表格，绿色标注正向提升\n\n点击预览画布可编辑任意元素。",
      },
    ],
    html: recsysHtml,
  },
  {
    id: "claude-code",
    title: "简笔画宣传图",
    description: "Claude Code 产品功能手绘海报",
    emoji: "✏️",
    inputText: claudeCodeInput,
    tasks: [
      { id: "t1", description: "设计布局：手绘标题 + 终端 + 功能卡片 + 场景标签", status: "done" },
      { id: "t2", description: "生成手绘标题区 + 终端窗口", status: "done" },
      { id: "t3", description: "生成 6 个功能卡片（带轻微旋转）", status: "done" },
      { id: "t4", description: "生成场景标签 + 装饰涂鸦", status: "done" },
      { id: "t5", description: "渲染评审并微调", status: "done" },
    ],
    messages: [
      { role: "user", content: claudeCodeInput },
      {
        role: "assistant",
        content: "这是一个产品宣传图需求，要求简笔画手绘风格。我会用 Caveat / Patrick Hand 手写字体，搭配纸质背景纹理、轻微旋转的卡片、手绘边框和涂鸦装饰，营造轻松活泼的氛围。终端窗口用深色对比，增加视觉层次。",
        toolCalls: [
          tc("tc1", "plan_design", {
            title: "Claude Code 宣传图",
            theme: "简笔画手绘风",
            sections: [
              { id: "header", name: "标题区", layout: "full", content: "手绘标题+副标题", visualType: "title" },
              { id: "terminal", name: "终端演示", layout: "full", content: "模拟终端交互", visualType: "code" },
              { id: "features", name: "功能卡片", layout: "grid", content: "6个核心功能", visualType: "cards" },
              { id: "scenarios", name: "场景标签", layout: "full", content: "4个适用场景", visualType: "tags" },
              { id: "footer", name: "页脚", layout: "full", content: "slogan+印章", visualType: "text" },
            ],
          }, "设计文档已创建：5 个 section，简笔画手绘主题"),
          tc("tc2", "add_tasks", { tasks: [
            { description: "设计布局" },
            { description: "标题+终端" },
            { description: "功能卡片" },
            { description: "场景+装饰" },
            { description: "渲染评审" },
          ] }, "已添加 5 个任务"),
        ],
      },
      {
        role: "assistant",
        content: "",
        toolCalls: [
          tc("tc3", "write_section", { sectionId: "header", html: "手绘标题" }, "已生成 header"),
          tc("tc4", "write_section", { sectionId: "terminal", html: "终端窗口" }, "已生成 terminal"),
          tc("tc5", "write_section", { sectionId: "features", html: "6个功能卡片" }, "已生成 features"),
          tc("tc6", "write_section", { sectionId: "scenarios", html: "场景标签" }, "已生成 scenarios"),
          tc("tc7", "write_section", { sectionId: "footer", html: "页脚+印章" }, "已生成 footer"),
        ],
      },
      {
        role: "assistant",
        content: "",
        toolCalls: [
          tc("tc8", "render_and_review", {}, JSON.stringify({ pass: true, score: 95, issues: [], summary: "手绘风格突出，卡片旋转角度自然，终端窗口增加层次感，涂鸦装饰点睛。" })),
        ],
      },
      {
        role: "assistant",
        content: "✅ Claude Code 简笔画宣传图已生成！\n\n**设计要点：**\n- 使用 Caveat / Patrick Hand 手写字体，营造手绘感\n- 米黄色纸质背景 + 横线纹理，模拟笔记本\n- 6 个功能卡片带轻微旋转（-1°~1.2°），活泼不死板\n- 终端窗口用深色对比 + 橙色阴影，突出核心卖点\n- 涂鸦装饰（星星、箭头）和「SHIP FAST!」印章增加趣味\n- 场景标签用虚线圆角，轻松随意\n\n点击预览画布可编辑任意元素。",
      },
    ],
    html: claudeCodeHtml,
  },
];
