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
<title>The Transformer Architecture</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    background: #ffffff;
    color: #202124;
    font-family: "Helvetica Neue", Arial, "PingFang SC", sans-serif;
  }
  body {
    width: 800px;
    padding: 30px 40px;
    margin: 0 auto;
  }
  .figure-card {
    border: 1px solid #dadce0;
    border-radius: 6px;
    padding: 28px 30px 24px;
    background: #ffffff;
  }
  h1 {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 26px;
    font-weight: 700;
    text-align: center;
    color: #202124;
    letter-spacing: 0.2px;
  }
  .subtitle {
    text-align: center;
    font-size: 12px;
    color: #5f6368;
    margin-top: 4px;
    font-style: italic;
    font-family: Georgia, serif;
  }
  .fig-label {
    text-align: center;
    font-size: 13px;
    color: #202124;
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
  }
  .fig-label .desc {
    font-weight: 400;
    color: #5f6368;
    font-family: Georgia, serif;
    font-style: italic;
  }
  .main-svg {
    display: block;
    margin: 0 auto;
  }
  .detail-row {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 22px;
    align-items: flex-start;
  }
  .detail {
    text-align: center;
  }
  .detail .cap {
    font-size: 12px;
    color: #202124;
    margin-bottom: 6px;
    font-weight: 600;
  }
  .detail .cap .d {
    font-weight: 400;
    color: #5f6368;
    font-family: Georgia, serif;
    font-style: italic;
  }
  .formulas {
    margin-top: 24px;
    padding: 16px 18px;
    background: #f8f9fa;
    border: 1px solid #e8eaed;
    border-radius: 6px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 15px;
    color: #202124;
    line-height: 2;
    text-align: center;
  }
  .formulas .fline { display: block; }
  .formulas i { font-style: italic; }
  .formulas sub, .formulas sup { font-size: 11px; }
  .params {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 18px;
    flex-wrap: wrap;
  }
  .param {
    border: 1px solid #dadce0;
    border-radius: 4px;
    padding: 6px 14px;
    font-size: 12px;
    color: #5f6368;
    background: #fff;
  }
  .param b {
    color: #202124;
    font-family: Georgia, serif;
    font-weight: 700;
    font-size: 14px;
    margin-right: 4px;
  }
  .caption {
    text-align: center;
    margin-top: 16px;
    font-size: 11px;
    color: #80868b;
    font-family: Georgia, serif;
    font-style: italic;
  }
  svg text { font-family: "Helvetica Neue", Arial, sans-serif; }
</style>
</head>
<body>
  <div class="figure-card">
    <h1>The Transformer Architecture</h1>
    <div class="subtitle">Attention Is All You Need · Vaswani et al., 2017</div>

    <div class="fig-label">Figure 1. <span class="desc">Encoder–Decoder architecture with stacked self-attention and feed-forward layers</span></div>

    <svg class="main-svg" width="720" height="560" viewBox="0 0 720 560" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrM" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#5f6368"/>
        </marker>
      </defs>

      <text x="150" y="30" text-anchor="middle" font-size="12" fill="#5f6368">Inputs</text>
      <line x1="150" y1="34" x2="150" y2="44" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <rect x="60" y="46" width="180" height="36" rx="3" fill="#fef7e0" stroke="#fbbc04" stroke-width="1.4"/>
      <text x="150" y="64" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#202124">Input Embedding</text>

      <line x1="150" y1="82" x2="150" y2="89" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <circle cx="150" cy="94" r="7" fill="#ffffff" stroke="#5f6368" stroke-width="1.3"/>
      <text x="150" y="94" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="700" fill="#5f6368">+</text>

      <rect x="250" y="82" width="66" height="24" rx="3" fill="#fef7e0" stroke="#fbbc04" stroke-width="1.4"/>
      <text x="283" y="91" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#202124">Positional</text>
      <text x="283" y="101" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#202124">Encoding</text>
      <line x1="250" y1="94" x2="158" y2="94" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <line x1="150" y1="101" x2="150" y2="110" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <rect x="60" y="112" width="180" height="46" rx="3" fill="#e8f0fe" stroke="#4285f4" stroke-width="1.4"/>
      <text x="150" y="130" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#202124">Multi-Head Self-Attention</text>
      <text x="150" y="146" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#5f6368">h = 8 · d_k = 64</text>

      <line x1="150" y1="158" x2="150" y2="168" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>
      <text x="150" y="178" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#e8710a" font-weight="600">Add &amp; Norm</text>
      <line x1="150" y1="184" x2="150" y2="190" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <rect x="60" y="192" width="180" height="46" rx="3" fill="#e6f4ea" stroke="#34a853" stroke-width="1.4"/>
      <text x="150" y="210" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#202124">Feed Forward</text>
      <text x="150" y="226" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#5f6368">d_ff = 2048 · ReLU</text>

      <line x1="150" y1="238" x2="150" y2="248" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>
      <text x="150" y="258" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#e8710a" font-weight="600">Add &amp; Norm</text>
      <line x1="150" y1="264" x2="150" y2="274" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <path d="M 60,112 L 44,112 L 44,178 L 56,178" fill="none" stroke="#5f6368" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#arrM)"/>
      <path d="M 60,192 L 44,192 L 44,258 L 56,258" fill="none" stroke="#5f6368" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#arrM)"/>

      <path d="M 36,112 L 30,112 L 30,258 L 36,258" fill="none" stroke="#5f6368" stroke-width="1.2"/>
      <text x="22" y="185" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#5f6368" font-weight="600" transform="rotate(-90 22 185)">×N = 6</text>

      <text x="490" y="30" text-anchor="middle" font-size="12" fill="#5f6368">Outputs (shifted right)</text>
      <line x1="490" y1="34" x2="490" y2="44" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <rect x="400" y="46" width="180" height="36" rx="3" fill="#fef7e0" stroke="#fbbc04" stroke-width="1.4"/>
      <text x="490" y="64" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#202124">Output Embedding</text>

      <line x1="490" y1="82" x2="490" y2="89" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <circle cx="490" cy="94" r="7" fill="#ffffff" stroke="#5f6368" stroke-width="1.3"/>
      <text x="490" y="94" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="700" fill="#5f6368">+</text>

      <rect x="334" y="82" width="66" height="24" rx="3" fill="#fef7e0" stroke="#fbbc04" stroke-width="1.4"/>
      <text x="367" y="91" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#202124">Positional</text>
      <text x="367" y="101" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#202124">Encoding</text>
      <line x1="400" y1="94" x2="482" y2="94" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <line x1="490" y1="101" x2="490" y2="110" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <rect x="400" y="112" width="180" height="46" rx="3" fill="#e8f0fe" stroke="#4285f4" stroke-width="1.4"/>
      <text x="490" y="130" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#202124">Masked Multi-Head Attention</text>
      <text x="490" y="146" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#5f6368">causal mask</text>

      <line x1="490" y1="158" x2="490" y2="168" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>
      <text x="490" y="178" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#e8710a" font-weight="600">Add &amp; Norm</text>
      <line x1="490" y1="184" x2="490" y2="190" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <rect x="400" y="192" width="180" height="46" rx="3" fill="#e8f0fe" stroke="#4285f4" stroke-width="1.4"/>
      <text x="490" y="210" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#202124">Cross-Attention</text>
      <text x="490" y="226" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#5f6368">Q ← Decoder · K, V ← Encoder</text>

      <line x1="490" y1="238" x2="490" y2="248" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>
      <text x="490" y="258" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#e8710a" font-weight="600">Add &amp; Norm</text>
      <line x1="490" y1="264" x2="490" y2="270" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <rect x="400" y="272" width="180" height="46" rx="3" fill="#e6f4ea" stroke="#34a853" stroke-width="1.4"/>
      <text x="490" y="290" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#202124">Feed Forward</text>
      <text x="490" y="306" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#5f6368">d_ff = 2048 · ReLU</text>

      <line x1="490" y1="318" x2="490" y2="328" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>
      <text x="490" y="338" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#e8710a" font-weight="600">Add &amp; Norm</text>
      <line x1="490" y1="344" x2="490" y2="350" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <rect x="400" y="352" width="180" height="36" rx="3" fill="#fce8e6" stroke="#ea4335" stroke-width="1.4"/>
      <text x="490" y="370" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#202124">Linear</text>

      <line x1="490" y1="388" x2="490" y2="396" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>

      <rect x="400" y="398" width="180" height="36" rx="3" fill="#fce8e6" stroke="#ea4335" stroke-width="1.4"/>
      <text x="490" y="416" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#202124">Softmax</text>

      <line x1="490" y1="434" x2="490" y2="444" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>
      <text x="490" y="456" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#5f6368">Output Probabilities</text>

      <path d="M 580,112 L 596,112 L 596,178 L 584,178" fill="none" stroke="#5f6368" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#arrM)"/>
      <path d="M 580,192 L 596,192 L 596,258 L 584,258" fill="none" stroke="#5f6368" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#arrM)"/>
      <path d="M 580,272 L 596,272 L 596,338 L 584,338" fill="none" stroke="#5f6368" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#arrM)"/>

      <path d="M 608,112 L 614,112 L 614,338 L 608,338" fill="none" stroke="#5f6368" stroke-width="1.2"/>
      <text x="622" y="225" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#5f6368" font-weight="600" transform="rotate(90 622 225)">×N = 6</text>

      <path d="M 150,274 L 150,294 L 370,294 L 370,215 L 396,215" fill="none" stroke="#5f6368" stroke-width="1.4" marker-end="url(#arrM)"/>
      <text x="260" y="288" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#5f6368" font-style="italic" font-family="Georgia, serif">K, V</text>

      <text x="150" y="500" text-anchor="middle" font-size="13" font-weight="700" fill="#202124" font-family="Georgia, serif">Encoder</text>
      <text x="490" y="500" text-anchor="middle" font-size="13" font-weight="700" fill="#202124" font-family="Georgia, serif">Decoder</text>
    </svg>

    <div class="detail-row">

      <div class="detail">
        <div class="cap">Figure 2. <span class="d">Scaled Dot-Product Attention</span></div>
        <svg width="340" height="120" viewBox="0 0 340 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrS" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#5f6368"/>
            </marker>
          </defs>

          <text x="16" y="50" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#202124" font-style="italic" font-family="Georgia, serif">Q</text>
          <line x1="24" y1="54" x2="34" y2="54" stroke="#5f6368" stroke-width="1.3" marker-end="url(#arrS)"/>
          <text x="16" y="72" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#202124" font-style="italic" font-family="Georgia, serif">K</text>
          <line x1="24" y1="66" x2="34" y2="66" stroke="#5f6368" stroke-width="1.3" marker-end="url(#arrS)"/>

          <rect x="36" y="42" width="54" height="36" rx="3" fill="#e8f0fe" stroke="#4285f4" stroke-width="1.3"/>
          <text x="63" y="60" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#202124">MatMul</text>
          <line x1="90" y1="60" x2="96" y2="60" stroke="#5f6368" stroke-width="1.3" marker-end="url(#arrS)"/>

          <rect x="96" y="42" width="54" height="36" rx="3" fill="#ffffff" stroke="#5f6368" stroke-width="1.3"/>
          <text x="123" y="55" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#202124">Scale</text>
          <text x="123" y="68" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#5f6368">÷√d_k</text>
          <line x1="150" y1="60" x2="156" y2="60" stroke="#5f6368" stroke-width="1.3" marker-end="url(#arrS)"/>

          <rect x="156" y="42" width="54" height="36" rx="3" fill="#ffffff" stroke="#5f6368" stroke-width="1.3" stroke-dasharray="4 3"/>
          <text x="183" y="55" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#202124">Mask</text>
          <text x="183" y="68" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#5f6368">(opt.)</text>
          <line x1="210" y1="60" x2="216" y2="60" stroke="#5f6368" stroke-width="1.3" marker-end="url(#arrS)"/>

          <rect x="216" y="42" width="54" height="36" rx="3" fill="#fce8e6" stroke="#ea4335" stroke-width="1.3"/>
          <text x="243" y="60" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#202124">Softmax</text>
          <line x1="270" y1="60" x2="276" y2="60" stroke="#5f6368" stroke-width="1.3" marker-end="url(#arrS)"/>

          <rect x="276" y="42" width="54" height="36" rx="3" fill="#e8f0fe" stroke="#4285f4" stroke-width="1.3"/>
          <text x="303" y="60" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#202124">MatMul</text>

          <text x="303" y="108" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#202124" font-style="italic" font-family="Georgia, serif">V</text>
          <line x1="303" y1="100" x2="303" y2="80" stroke="#5f6368" stroke-width="1.3" marker-end="url(#arrS)"/>

          <line x1="330" y1="60" x2="338" y2="60" stroke="#5f6368" stroke-width="1.3" marker-end="url(#arrS)"/>
          <text x="338" y="48" text-anchor="end" dominant-baseline="central" font-size="9" fill="#5f6368">Output</text>
        </svg>
      </div>

      <div class="detail">
        <div class="cap">Figure 3. <span class="d">Multi-Head Attention</span></div>
        <svg width="340" height="160" viewBox="0 0 340 160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrH" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#5f6368"/>
            </marker>
          </defs>

          <text x="12" y="36" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#202124" font-style="italic" font-family="Georgia, serif">V</text>
          <text x="12" y="76" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#202124" font-style="italic" font-family="Georgia, serif">K</text>
          <text x="12" y="116" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#202124" font-style="italic" font-family="Georgia, serif">Q</text>

          <rect x="22" y="23" width="44" height="26" rx="3" fill="#e6f4ea" stroke="#34a853" stroke-width="1.3"/>
          <text x="44" y="36" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#202124">Linear</text>
          <rect x="22" y="63" width="44" height="26" rx="3" fill="#e6f4ea" stroke="#34a853" stroke-width="1.3"/>
          <text x="44" y="76" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#202124">Linear</text>
          <rect x="22" y="103" width="44" height="26" rx="3" fill="#e6f4ea" stroke="#34a853" stroke-width="1.3"/>
          <text x="44" y="116" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#202124">Linear</text>

          <g stroke="#5f6368" stroke-width="0.9" fill="none">
            <line x1="66" y1="36" x2="100" y2="31"/>
            <line x1="66" y1="36" x2="100" y2="59"/>
            <line x1="66" y1="36" x2="100" y2="87"/>
            <line x1="66" y1="76" x2="100" y2="31"/>
            <line x1="66" y1="76" x2="100" y2="59"/>
            <line x1="66" y1="76" x2="100" y2="87"/>
            <line x1="66" y1="116" x2="100" y2="31"/>
            <line x1="66" y1="116" x2="100" y2="59"/>
            <line x1="66" y1="116" x2="100" y2="87"/>
          </g>

          <rect x="100" y="20" width="96" height="22" rx="3" fill="#e8f0fe" stroke="#4285f4" stroke-width="1.2"/>
          <text x="148" y="27" text-anchor="middle" dominant-baseline="central" font-size="8" fill="#202124">Scaled Dot-Product</text>
          <text x="148" y="37" text-anchor="middle" dominant-baseline="central" font-size="8" fill="#202124">Attention</text>

          <rect x="100" y="48" width="96" height="22" rx="3" fill="#e8f0fe" stroke="#4285f4" stroke-width="1.2"/>
          <text x="148" y="55" text-anchor="middle" dominant-baseline="central" font-size="8" fill="#202124">Scaled Dot-Product</text>
          <text x="148" y="65" text-anchor="middle" dominant-baseline="central" font-size="8" fill="#202124">Attention</text>

          <rect x="100" y="76" width="96" height="22" rx="3" fill="#e8f0fe" stroke="#4285f4" stroke-width="1.2"/>
          <text x="148" y="83" text-anchor="middle" dominant-baseline="central" font-size="8" fill="#202124">Scaled Dot-Product</text>
          <text x="148" y="93" text-anchor="middle" dominant-baseline="central" font-size="8" fill="#202124">Attention</text>

          <text x="148" y="110" text-anchor="middle" dominant-baseline="central" font-size="16" fill="#5f6368">⋯</text>

          <path d="M 196,20 L 204,20 L 204,98 L 196,98" fill="none" stroke="#5f6368" stroke-width="1.1"/>
          <text x="210" y="14" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#5f6368" font-weight="600">× h</text>

          <line x1="196" y1="31" x2="220" y2="60" stroke="#5f6368" stroke-width="1.2" marker-end="url(#arrH)"/>
          <line x1="196" y1="59" x2="220" y2="60" stroke="#5f6368" stroke-width="1.2" marker-end="url(#arrH)"/>
          <line x1="196" y1="87" x2="220" y2="60" stroke="#5f6368" stroke-width="1.2" marker-end="url(#arrH)"/>

          <rect x="220" y="42" width="48" height="36" rx="3" fill="#fef7e0" stroke="#fbbc04" stroke-width="1.3"/>
          <text x="244" y="60" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#202124">Concat</text>
          <line x1="268" y1="60" x2="276" y2="60" stroke="#5f6368" stroke-width="1.3" marker-end="url(#arrH)"/>

          <rect x="278" y="42" width="48" height="36" rx="3" fill="#e6f4ea" stroke="#34a853" stroke-width="1.3"/>
          <text x="302" y="60" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#202124">Linear</text>

          <line x1="326" y1="60" x2="336" y2="60" stroke="#5f6368" stroke-width="1.3" marker-end="url(#arrH)"/>
          <text x="336" y="48" text-anchor="end" dominant-baseline="central" font-size="9" fill="#5f6368">Output</text>
        </svg>
      </div>
    </div>

    <div class="formulas">
      <span class="fline"><i>Attention</i>(Q, K, V) = softmax( QK<sup>T</sup> / √d<sub>k</sub> ) · V</span>
      <span class="fline"><i>MultiHead</i>(Q, K, V) = Concat(head<sub>1</sub>, …, head<sub>h</sub>) W<sup>O</sup></span>
      <span class="fline">head<sub>i</sub> = <i>Attention</i>(QW<sub>i</sub><sup>Q</sup>, KW<sub>i</sub><sup>K</sup>, VW<sub>i</sub><sup>V</sup>)</span>
    </div>

    <div class="params">
      <div class="param"><b>512</b>d_model</div>
      <div class="param"><b>8</b>heads (h)</div>
      <div class="param"><b>64</b>d_k = d_v</div>
      <div class="param"><b>2048</b>d_ff</div>
      <div class="param"><b>6</b>layers (N)</div>
    </div>

    <div class="caption">O(1) sequential-path length · highly parallelizable · fully attention-based</div>
  </div>
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
  .svg-wrap { display: flex; justify-content: center; margin: 8px 0; }
  .loss-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 2px; }
  .loss-main { background: #fef3c7; color: #92400e; }
  .loss-aux { background: #e0e7ff; color: #3730a3; }
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
      <div class="svg-wrap" style="margin:10px 0 0">
        <svg width="340" height="160" viewBox="0 0 340 160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrF" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#64748b"/>
            </marker>
          </defs>
          <text x="85" y="14" text-anchor="middle" font-size="11" font-weight="600" fill="#1e40af">FM · 低阶交互</text>
          <text x="255" y="14" text-anchor="middle" font-size="11" font-weight="600" fill="#9d174d">DNN · 高阶交互</text>
          <line x1="170" y1="22" x2="170" y2="150" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3"/>
          <circle cx="28" cy="48" r="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.3"/>
          <text x="28" y="48" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#1e40af">f1</text>
          <circle cx="28" cy="76" r="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.3"/>
          <text x="28" y="76" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#1e40af">f2</text>
          <circle cx="28" cy="104" r="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.3"/>
          <text x="28" y="104" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#1e40af">f3</text>
          <circle cx="28" cy="132" r="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.3"/>
          <text x="28" y="132" text-anchor="middle" dominant-baseline="central" font-size="9" fill="#1e40af">f4</text>
          <g stroke="#3b82f6" stroke-width="0.8" opacity="0.45" fill="none">
            <path d="M 36,48 Q 70,62 36,76"/>
            <path d="M 36,48 Q 78,76 36,104"/>
            <path d="M 36,48 Q 86,90 36,132"/>
            <path d="M 36,76 Q 70,90 36,104"/>
            <path d="M 36,76 Q 78,104 36,132"/>
            <path d="M 36,104 Q 70,118 36,132"/>
          </g>
          <line x1="36" y1="48" x2="118" y2="90" stroke="#3b82f6" stroke-width="1" marker-end="url(#arrF)"/>
          <line x1="36" y1="76" x2="118" y2="90" stroke="#3b82f6" stroke-width="1" marker-end="url(#arrF)"/>
          <line x1="36" y1="104" x2="118" y2="90" stroke="#3b82f6" stroke-width="1" marker-end="url(#arrF)"/>
          <line x1="36" y1="132" x2="118" y2="90" stroke="#3b82f6" stroke-width="1" marker-end="url(#arrF)"/>
          <rect x="118" y="80" width="44" height="22" rx="4" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.3"/>
          <text x="140" y="91" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="600" fill="#1e40af">FM</text>
          <text x="85" y="152" text-anchor="middle" font-size="9" fill="#64748b">一阶 + 二阶交叉</text>
          <circle cx="195" cy="52" r="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.3"/>
          <circle cx="195" cy="76" r="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.3"/>
          <circle cx="195" cy="100" r="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.3"/>
          <circle cx="195" cy="124" r="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.3"/>
          <circle cx="235" cy="64" r="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.3"/>
          <circle cx="235" cy="88" r="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.3"/>
          <circle cx="235" cy="112" r="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.3"/>
          <circle cx="275" cy="76" r="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.3"/>
          <circle cx="275" cy="100" r="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.3"/>
          <circle cx="315" cy="88" r="7" fill="#ec4899" stroke="#9d174d" stroke-width="1.3"/>
          <g stroke="#ec4899" stroke-width="0.5" opacity="0.45">
            <line x1="201" y1="52" x2="229" y2="64"/>
            <line x1="201" y1="52" x2="229" y2="88"/>
            <line x1="201" y1="76" x2="229" y2="64"/>
            <line x1="201" y1="76" x2="229" y2="88"/>
            <line x1="201" y1="76" x2="229" y2="112"/>
            <line x1="201" y1="100" x2="229" y2="88"/>
            <line x1="201" y1="100" x2="229" y2="112"/>
            <line x1="201" y1="124" x2="229" y2="112"/>
            <line x1="241" y1="64" x2="269" y2="76"/>
            <line x1="241" y1="64" x2="269" y2="100"/>
            <line x1="241" y1="88" x2="269" y2="76"/>
            <line x1="241" y1="88" x2="269" y2="100"/>
            <line x1="241" y1="112" x2="269" y2="100"/>
            <line x1="281" y1="76" x2="308" y2="88"/>
            <line x1="281" y1="100" x2="308" y2="88"/>
          </g>
          <text x="255" y="152" text-anchor="middle" font-size="9" fill="#64748b">多层非线性高阶</text>
        </svg>
      </div>
    </div>
    <div class="card full">
      <div class="card-title">数据流水线 · 端到端流程</div>
      <div class="svg-wrap">
        <svg width="720" height="130" viewBox="0 0 720 130" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrP" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#64748b"/>
            </marker>
          </defs>
          <rect x="20" y="28" width="120" height="74" rx="10" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>
          <ellipse cx="80" cy="48" rx="16" ry="5" fill="none" stroke="#6366f1" stroke-width="1.4"/>
          <path d="M 64,48 L 64,66 Q 64,71 80,71 Q 96,71 96,66 L 96,48" fill="none" stroke="#6366f1" stroke-width="1.4"/>
          <ellipse cx="80" cy="57" rx="16" ry="5" fill="none" stroke="#6366f1" stroke-width="1.2" opacity="0.5"/>
          <text x="80" y="90" text-anchor="middle" font-size="12" font-weight="600" fill="#3730a3">数据采集</text>
          <line x1="140" y1="65" x2="158" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrP)"/>
          <rect x="160" y="28" width="120" height="74" rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
          <circle cx="220" cy="56" r="11" fill="none" stroke="#3b82f6" stroke-width="1.4"/>
          <circle cx="220" cy="56" r="4" fill="none" stroke="#3b82f6" stroke-width="1.4"/>
          <line x1="220" y1="41" x2="220" y2="45" stroke="#3b82f6" stroke-width="2"/>
          <line x1="220" y1="67" x2="220" y2="71" stroke="#3b82f6" stroke-width="2"/>
          <line x1="205" y1="56" x2="209" y2="56" stroke="#3b82f6" stroke-width="2"/>
          <line x1="231" y1="56" x2="235" y2="56" stroke="#3b82f6" stroke-width="2"/>
          <line x1="210" y1="46" x2="213" y2="49" stroke="#3b82f6" stroke-width="1.6"/>
          <line x1="227" y1="63" x2="230" y2="66" stroke="#3b82f6" stroke-width="1.6"/>
          <line x1="210" y1="66" x2="213" y2="63" stroke="#3b82f6" stroke-width="1.6"/>
          <line x1="227" y1="49" x2="230" y2="46" stroke="#3b82f6" stroke-width="1.6"/>
          <text x="220" y="90" text-anchor="middle" font-size="12" font-weight="600" fill="#1e40af">特征工程</text>
          <line x1="280" y1="65" x2="298" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrP)"/>
          <rect x="300" y="28" width="120" height="74" rx="10" fill="#fce7f3" stroke="#ec4899" stroke-width="1.5"/>
          <circle cx="325" cy="48" r="3" fill="#ec4899"/>
          <circle cx="325" cy="64" r="3" fill="#ec4899"/>
          <circle cx="345" cy="42" r="3" fill="#ec4899"/>
          <circle cx="345" cy="56" r="3" fill="#ec4899"/>
          <circle cx="345" cy="70" r="3" fill="#ec4899"/>
          <circle cx="365" cy="48" r="3" fill="#ec4899"/>
          <circle cx="365" cy="64" r="3" fill="#ec4899"/>
          <circle cx="385" cy="56" r="3" fill="#ec4899"/>
          <g stroke="#ec4899" stroke-width="0.7" opacity="0.55">
            <line x1="325" y1="48" x2="345" y2="42"/>
            <line x1="325" y1="48" x2="345" y2="56"/>
            <line x1="325" y1="64" x2="345" y2="56"/>
            <line x1="325" y1="64" x2="345" y2="70"/>
            <line x1="345" y1="42" x2="365" y2="48"/>
            <line x1="345" y1="56" x2="365" y2="48"/>
            <line x1="345" y1="56" x2="365" y2="64"/>
            <line x1="345" y1="70" x2="365" y2="64"/>
            <line x1="365" y1="48" x2="385" y2="56"/>
            <line x1="365" y1="64" x2="385" y2="56"/>
          </g>
          <text x="360" y="90" text-anchor="middle" font-size="12" font-weight="600" fill="#9d174d">模型训练</text>
          <line x1="420" y1="65" x2="438" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrP)"/>
          <rect x="440" y="28" width="120" height="74" rx="10" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/>
          <rect x="472" y="42" width="56" height="13" rx="2" fill="none" stroke="#10b981" stroke-width="1.4"/>
          <rect x="472" y="59" width="56" height="13" rx="2" fill="none" stroke="#10b981" stroke-width="1.4"/>
          <circle cx="479" cy="48" r="1.5" fill="#10b981"/>
          <circle cx="479" cy="65" r="1.5" fill="#10b981"/>
          <line x1="486" y1="48" x2="520" y2="48" stroke="#10b981" stroke-width="0.8" opacity="0.4"/>
          <line x1="486" y1="65" x2="520" y2="65" stroke="#10b981" stroke-width="0.8" opacity="0.4"/>
          <text x="500" y="90" text-anchor="middle" font-size="12" font-weight="600" fill="#065f46">线上推理</text>
          <line x1="560" y1="65" x2="578" y2="65" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrP)"/>
          <rect x="580" y="28" width="120" height="74" rx="10" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
          <line x1="600" y1="72" x2="660" y2="72" stroke="#d97706" stroke-width="1.2"/>
          <rect x="606" y="58" width="9" height="14" fill="#d97706"/>
          <rect x="619" y="50" width="9" height="22" fill="#d97706"/>
          <rect x="632" y="44" width="9" height="28" fill="#d97706"/>
          <rect x="645" y="54" width="9" height="18" fill="#d97706"/>
          <text x="640" y="90" text-anchor="middle" font-size="12" font-weight="600" fill="#92400e">AB 实验</text>
        </svg>
      </div>
      <p style="font-size:11px;color:#64748b;margin-top:6px;text-align:center">日志采集 → 离线特征 → 模型训练 → 在线推理 → 实验评估，全链路闭环</p>
    </div>
    <div class="card full">
      <div class="card-title"><span class="num">3</span>模型结构 — DeepFM 架构图</div>
      <div class="svg-wrap">
        <svg width="720" height="390" viewBox="0 0 720 390" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#64748b"/>
            </marker>
          </defs>
          <rect x="280" y="14" width="160" height="34" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
          <text x="360" y="31" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="600" fill="#92400e">Sparse Features</text>
          <line x1="360" y1="48" x2="360" y2="60" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrR)"/>
          <rect x="270" y="62" width="180" height="36" rx="6" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>
          <text x="360" y="80" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="600" fill="#3730a3">Embedding Layer</text>
          <line x1="360" y1="98" x2="360" y2="114" stroke="#64748b" stroke-width="1.5"/>
          <line x1="160" y1="114" x2="560" y2="114" stroke="#64748b" stroke-width="1.5"/>
          <line x1="160" y1="114" x2="160" y2="128" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrR)"/>
          <line x1="560" y1="114" x2="560" y2="128" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrR)"/>
          <text x="160" y="108" text-anchor="middle" font-size="11" fill="#1d4ed8" font-weight="600">FM (Wide)</text>
          <text x="560" y="108" text-anchor="middle" font-size="11" fill="#be185d" font-weight="600">DNN (Deep)</text>
          <rect x="70" y="130" width="180" height="32" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.4"/>
          <text x="160" y="146" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#1e40af">一阶交叉 · 1st Order</text>
          <line x1="160" y1="162" x2="160" y2="176" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrR)"/>
          <rect x="70" y="178" width="180" height="32" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.4"/>
          <text x="160" y="194" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#1e40af">二阶交叉 · 2nd Order</text>
          <rect x="470" y="130" width="180" height="32" rx="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.4"/>
          <text x="560" y="146" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#9d174d">Dense 512 · ReLU</text>
          <line x1="560" y1="162" x2="560" y2="176" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrR)"/>
          <rect x="470" y="178" width="180" height="32" rx="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.4"/>
          <text x="560" y="194" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#9d174d">Dense 256 · ReLU</text>
          <line x1="560" y1="210" x2="560" y2="224" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrR)"/>
          <rect x="470" y="226" width="180" height="32" rx="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.4"/>
          <text x="560" y="242" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#9d174d">Dense 128 · ReLU</text>
          <line x1="560" y1="258" x2="560" y2="272" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrR)"/>
          <rect x="470" y="274" width="180" height="32" rx="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.4"/>
          <text x="560" y="290" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#9d174d">Dense 1</text>
          <line x1="160" y1="210" x2="160" y2="330" stroke="#64748b" stroke-width="1.5"/>
          <line x1="160" y1="330" x2="340" y2="330" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrR)"/>
          <line x1="560" y1="306" x2="560" y2="330" stroke="#64748b" stroke-width="1.5"/>
          <line x1="560" y1="330" x2="384" y2="330" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrR)"/>
          <circle cx="360" cy="330" r="14" fill="#fff" stroke="#64748b" stroke-width="1.5"/>
          <text x="360" y="330" text-anchor="middle" dominant-baseline="central" font-size="16" font-weight="700" fill="#64748b">+</text>
          <line x1="360" y1="344" x2="360" y2="356" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrR)"/>
          <rect x="290" y="358" width="140" height="26" rx="6" fill="#1e293b"/>
          <text x="360" y="371" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="#fff">Sigmoid → 输出</text>
        </svg>
      </div>
      <p style="font-size:11px;color:#64748b;margin-top:8px;text-align:center">Wide 部分捕捉低阶交互 · Deep 部分捕捉高阶非线性 · 共享 Embedding 联合训练</p>
    </div>
    <div class="card">
      <div class="card-title"><span class="num">4</span>损失函数</div>
      <div style="margin:6px 0">
        <span class="loss-badge loss-main">BCE Loss · 点击预测</span>
        <span class="loss-badge loss-aux">Weighted MSE · 停留时长 (w=0.3)</span>
      </div>
      <div class="svg-wrap" style="margin:8px 0 0">
        <svg width="340" height="180" viewBox="0 0 340 180" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrL" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#64748b"/>
            </marker>
          </defs>
          <rect x="120" y="12" width="100" height="26" rx="5" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.4"/>
          <text x="170" y="25" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#3730a3">Input Features</text>
          <line x1="170" y1="38" x2="170" y2="48" stroke="#64748b" stroke-width="1.4" marker-end="url(#arrL)"/>
          <rect x="110" y="50" width="120" height="26" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.4"/>
          <text x="170" y="63" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#1e40af">Shared Bottom</text>
          <line x1="170" y1="76" x2="170" y2="86" stroke="#64748b" stroke-width="1.4"/>
          <line x1="80" y1="86" x2="260" y2="86" stroke="#64748b" stroke-width="1.4"/>
          <line x1="80" y1="86" x2="80" y2="96" stroke="#64748b" stroke-width="1.4" marker-end="url(#arrL)"/>
          <line x1="260" y1="86" x2="260" y2="96" stroke="#64748b" stroke-width="1.4" marker-end="url(#arrL)"/>
          <rect x="30" y="98" width="100" height="24" rx="5" fill="#d1fae5" stroke="#10b981" stroke-width="1.4"/>
          <text x="80" y="110" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#065f46">Tower · Dense 128</text>
          <line x1="80" y1="122" x2="80" y2="130" stroke="#64748b" stroke-width="1.4" marker-end="url(#arrL)"/>
          <rect x="30" y="132" width="100" height="24" rx="5" fill="#fef3c7" stroke="#d97706" stroke-width="1.4"/>
          <text x="80" y="144" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="600" fill="#92400e">BCE · 点击</text>
          <rect x="210" y="98" width="100" height="24" rx="5" fill="#fce7f3" stroke="#ec4899" stroke-width="1.4"/>
          <text x="260" y="110" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#9d174d">Tower · Dense 128</text>
          <line x1="260" y1="122" x2="260" y2="130" stroke="#64748b" stroke-width="1.4" marker-end="url(#arrL)"/>
          <rect x="210" y="132" width="100" height="24" rx="5" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.4"/>
          <text x="260" y="144" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="600" fill="#3730a3">MSE · 时长 (w=0.3)</text>
          <text x="80" y="172" text-anchor="middle" font-size="9" fill="#64748b">主任务</text>
          <text x="260" y="172" text-anchor="middle" font-size="9" fill="#64748b">辅助任务</text>
        </svg>
      </div>
      <p style="font-size:11px;color:#64748b;margin-top:8px">多任务联合优化，主任务点击率 + 辅助任务时长</p>
    </div>
    <div class="card">
      <div class="card-title"><span class="num">5</span>AB 实验结果</div>
      <div class="svg-wrap" style="margin:4px 0">
        <svg width="340" height="200" viewBox="0 0 340 200" xmlns="http://www.w3.org/2000/svg">
          <text x="170" y="18" text-anchor="middle" font-size="12" font-weight="600" fill="#1e293b">AB 实验指标提升</text>
          <text x="170" y="34" text-anchor="middle" font-size="10" fill="#94a3b8">绿色：指标提升 · 蓝色：耗时下降</text>
          <line x1="30" y1="160" x2="330" y2="160" stroke="#94a3b8" stroke-width="1.5"/>
          <rect x="50" y="83" width="50" height="77" rx="3" fill="#10b981" stroke="#059669" stroke-width="1.2"/>
          <text x="75" y="76" text-anchor="middle" font-size="12" font-weight="700" fill="#059669">+4.8%</text>
          <text x="75" y="176" text-anchor="middle" font-size="11" fill="#475569">CTR</text>
          <rect x="120" y="123" width="50" height="37" rx="3" fill="#10b981" stroke="#059669" stroke-width="1.2"/>
          <text x="145" y="116" text-anchor="middle" font-size="12" font-weight="700" fill="#059669">+2.3%</text>
          <text x="145" y="176" text-anchor="middle" font-size="11" fill="#475569">CVR</text>
          <rect x="190" y="62" width="50" height="98" rx="3" fill="#10b981" stroke="#059669" stroke-width="1.2"/>
          <text x="215" y="55" text-anchor="middle" font-size="12" font-weight="700" fill="#059669">+6.1%</text>
          <text x="215" y="176" text-anchor="middle" font-size="11" fill="#475569">停留时长</text>
          <rect x="260" y="80" width="50" height="80" rx="3" fill="#3b82f6" stroke="#2563eb" stroke-width="1.2"/>
          <text x="285" y="73" text-anchor="middle" font-size="12" font-weight="700" fill="#2563eb">-20%</text>
          <text x="285" y="176" text-anchor="middle" font-size="11" fill="#475569">推理耗时</text>
        </svg>
      </div>
      <p style="font-size:11px;color:#64748b;text-align:center">实验组 50% 流量 · 14 天 · 全部指标显著正向</p>
    </div>
  </div>
  <div class="footer">DeepFM · 共享 Embedding · FM + DNN 联合训练 · 线上推理 28ms</div>
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
  .workflow { display: flex; justify-content: center; margin: 0 auto 24px; }
  .workflow-box { background: #fff; border: 2.5px dashed #d97706; border-radius: 16px; padding: 10px 20px; box-shadow: 3px 3px 0 rgba(217,119,6,0.2); transform: rotate(0.3deg); }
  .title-doodle { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); z-index: 0; pointer-events: none; }
  .title-area h1 { z-index: 1; }
  .title-area .subtitle { position: relative; z-index: 1; }
  .feature .icon svg { display: block; }
</style>
</head>
<body>
  <div class="wrap">
    <span class="doodle doodle-star">✦</span>
    <span class="doodle doodle-star2">✧</span>
    <div class="title-area">
      <svg class="title-doodle" width="380" height="80" viewBox="0 0 380 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20,60 Q60,15 120,40 Q180,65 240,30 Q300,0 360,35" stroke="#d97706" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.35"/>
        <path d="M30,68 Q90,25 150,48 Q210,70 270,38 Q330,10 370,42" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.3"/>
        <path d="M15,50 Q50,20 100,35 Q140,48 180,28 Q220,10 260,32 Q300,55 340,25 L360,38" stroke="#2d2d2d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.15"/>
        <circle cx="95" cy="22" r="3" fill="#fbbf24" opacity="0.5"/>
        <circle cx="250" cy="18" r="2.5" fill="#d97706" opacity="0.4"/>
        <circle cx="340" cy="30" r="2" fill="#fbbf24" opacity="0.5"/>
      </svg>
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
    <div class="workflow">
      <div class="workflow-box">
        <svg width="700" height="90" viewBox="0 0 700 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
            <rect x="20" y="20" width="100" height="50" rx="8" fill="#fef3c7"/>
            <text x="70" y="42" text-anchor="middle" font-family="Patrick Hand, cursive" font-size="13" fill="#2d2d2d" stroke="none">输入需求</text>
            <text x="70" y="60" text-anchor="middle" font-family="monospace" font-size="11" fill="#d97706" stroke="none">&gt; 重构模块</text>
          </g>
          <path d="M125,40 Q140,38 155,40" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" fill="none"/>
          <path d="M150,36 L156,40 L150,44" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <g stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
            <rect x="160" y="20" width="100" height="50" rx="8" fill="#fef3c7"/>
            <text x="210" y="42" text-anchor="middle" font-family="Patrick Hand, cursive" font-size="13" fill="#2d2d2d" stroke="none">理解代码</text>
            <text x="210" y="60" text-anchor="middle" font-family="monospace" font-size="11" fill="#d97706" stroke="none">扫描代码库</text>
          </g>
          <path d="M265,40 Q280,38 295,40" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" fill="none"/>
          <path d="M290,36 L296,40 L290,44" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <g stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
            <rect x="300" y="20" width="100" height="50" rx="8" fill="#fef3c7"/>
            <text x="350" y="42" text-anchor="middle" font-family="Patrick Hand, cursive" font-size="13" fill="#2d2d2d" stroke="none">编辑文件</text>
            <text x="350" y="60" text-anchor="middle" font-family="monospace" font-size="11" fill="#d97706" stroke="none">5 files</text>
          </g>
          <path d="M405,40 Q420,38 435,40" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" fill="none"/>
          <path d="M430,36 L436,40 L430,44" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <g stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
            <rect x="440" y="20" width="100" height="50" rx="8" fill="#fef3c7"/>
            <text x="490" y="42" text-anchor="middle" font-family="Patrick Hand, cursive" font-size="13" fill="#2d2d2d" stroke="none">运行测试</text>
            <text x="490" y="60" text-anchor="middle" font-family="monospace" font-size="11" fill="#22c55e" stroke="none">✓ passed</text>
          </g>
          <path d="M545,40 Q560,38 575,40" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" fill="none"/>
          <path d="M570,36 L576,40 L570,44" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <g stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
            <rect x="580" y="20" width="100" height="50" rx="8" fill="#22c55e"/>
            <text x="630" y="42" text-anchor="middle" font-family="Patrick Hand, cursive" font-size="13" fill="#fff" stroke="none">完成！</text>
            <text x="630" y="60" text-anchor="middle" font-family="monospace" font-size="11" fill="#fef9f0" stroke="none">ship it</text>
          </g>
        </svg>
      </div>
    </div>
    <div class="features">
      <div class="feature">
        <span class="num">1</span>
        <span class="icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="32" height="24" rx="3" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#fef3c7"/><line x1="4" y1="14" x2="36" y2="14" stroke="#2d2d2d" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="11" r="1.2" fill="#ef4444"/><circle cx="13" cy="11" r="1.2" fill="#fbbf24"/><circle cx="17" cy="11" r="1.2" fill="#22c55e"/><text x="12" y="26" font-family="monospace" font-size="11" fill="#d97706" stroke="none" font-weight="700">&gt;_</text></svg></span>
        <h3>终端原生</h3>
        <p>直接在命令行运行，不用切 IDE</p>
      </div>
      <div class="feature">
        <span class="num">2</span>
        <span class="icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 7 C12 7, 9 10, 9 14 C7 15, 7 18, 9 20 C8 22, 9 25, 12 26 C13 29, 16 30, 19 29 L19 7 Z" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#fef3c7"/><path d="M24 7 C28 7, 31 10, 31 14 C33 15, 33 18, 31 20 C32 22, 31 25, 28 26 C27 29, 24 30, 21 29 L21 7 Z" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#fef3c7"/><circle cx="14" cy="15" r="1.5" fill="#d97706"/><circle cx="26" cy="15" r="1.5" fill="#d97706"/><circle cx="20" cy="20" r="1.5" fill="#d97706"/><line x1="14" y1="15" x2="20" y2="20" stroke="#d97706" stroke-width="1.2" stroke-linecap="round"/><line x1="26" y1="15" x2="20" y2="20" stroke="#d97706" stroke-width="1.2" stroke-linecap="round"/><line x1="14" y1="15" x2="26" y2="15" stroke="#d97706" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="2 2"/></svg></span>
        <h3>代码理解</h3>
        <p>懂整个代码库结构和依赖关系</p>
      </div>
      <div class="feature">
        <span class="num">3</span>
        <span class="icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 30 L11 28 L29 10 L33 14 L15 32 L12 34 Z" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#fbbf24"/><line x1="27" y1="12" x2="31" y2="16" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/><line x1="11" y1="28" x2="15" y2="32" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="10" x2="10" y2="10" stroke="#d97706" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="14" x2="8" y2="14" stroke="#d97706" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="18" x2="10" y2="18" stroke="#d97706" stroke-width="1.5" stroke-linecap="round"/></svg></span>
        <h3>自动编辑</h3>
        <p>直接改文件，不只是给建议</p>
      </div>
      <div class="feature">
        <span class="num">4</span>
        <span class="icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 4 C26 8, 30 14, 30 22 L30 28 L10 28 L10 22 C10 14, 14 8, 20 4 Z" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#fef3c7"/><circle cx="20" cy="16" r="3" stroke="#d97706" stroke-width="2" fill="#fff"/><path d="M10 22 L5 26 L5 30 L10 28" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#fbbf24"/><path d="M30 22 L35 26 L35 30 L30 28" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#fbbf24"/><path d="M14 32 L16 36" stroke="#d97706" stroke-width="2" stroke-linecap="round"/><path d="M20 32 L20 38" stroke="#d97706" stroke-width="2" stroke-linecap="round"/><path d="M26 32 L24 36" stroke="#d97706" stroke-width="2" stroke-linecap="round"/></svg></span>
        <h3>执行命令</h3>
        <p>跑测试、git 操作、构建一条龙</p>
      </div>
      <div class="feature">
        <span class="num">5</span>
        <span class="icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12 L4 32 L24 32 L24 14 L14 14 L11 11 L4 11 Z" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#fef3c7"/><rect x="16" y="8" width="18" height="22" rx="1.5" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#fff"/><line x1="20" y1="14" x2="30" y2="14" stroke="#d97706" stroke-width="1.5" stroke-linecap="round"/><line x1="20" y1="18" x2="30" y2="18" stroke="#d97706" stroke-width="1.5" stroke-linecap="round"/><line x1="20" y1="22" x2="28" y2="22" stroke="#d97706" stroke-width="1.5" stroke-linecap="round"/></svg></span>
        <h3>多文件编辑</h3>
        <p>跨文件重构，保持一致性</p>
      </div>
      <div class="feature">
        <span class="num">6</span>
        <span class="icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="18" width="24" height="18" rx="2" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#fbbf24"/><path d="M13 18 L13 12 C13 8, 16 5, 20 5 C24 5, 27 8, 27 12 L27 18" stroke="#2d2d2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M15 26 L19 30 L25 23" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></span>
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
