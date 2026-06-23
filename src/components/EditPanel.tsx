import { useRef } from "react";
import { X, Trash2, Upload, Type, Move, Maximize, Palette, Image as ImageIcon } from "lucide-react";
import { useStore } from "@/store/useStore";

interface EditPanelProps {
  onApplyStyle: (styles: Record<string, string>) => void;
  onApplyText: (text: string) => void;
  onApplyHtml: (html: string) => void;
  onDelete: () => void;
  onReplaceSvg: (dataUrl: string) => void;
}

export function EditPanel({ onApplyStyle, onApplyText, onApplyHtml, onDelete, onReplaceSvg }: EditPanelProps) {
  const selected = useStore((s) => s.selectedElement);
  const setSelectedElement = useStore((s) => s.setSelectedElement);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selected) return null;

  const s = selected.styles;
  const isImg = selected.tagName === "img";
  const isSvg = selected.isSVG;
  const isTextLike = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "label", "button", "li", "div"].includes(selected.tagName);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onReplaceSvg(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const num = (v: string) => parseFloat(v) || 0;
  const pxVal = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? "" : String(n);
  };

  return (
    <div key={selected.selectionId} className="absolute top-12 right-0 bottom-0 w-80 bg-white border-l border-zinc-200 shadow-xl flex flex-col z-20 animate-slide-up">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-brand-600/10 border border-brand-500/20 flex items-center justify-center shrink-0">
            <Type className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-zinc-800 truncate">
              &lt;{selected.tagName}&gt;
            </div>
            <div className="text-[10px] text-zinc-400">
              {Math.round(selected.rect.width)} × {Math.round(selected.rect.height)} px
            </div>
          </div>
        </div>
        <button
          onClick={() => setSelectedElement(null)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors shrink-0"
          title="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin">
        {/* SVG / Image 替换 */}
        {(isSvg || isImg) && (
          <Section icon={<ImageIcon className="w-3.5 h-3.5" />} title={isSvg ? "替换 SVG" : "替换图片"}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-brand-300 bg-brand-50/50 text-brand-600 hover:bg-brand-50 text-xs font-medium transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              上传本地图片替换
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
              支持 PNG / JPG / SVG / WebP，上传后将用 &lt;img&gt; 替换当前{isSvg ? "SVG" : "图片"}。
            </p>
          </Section>
        )}

        {/* 内容编辑 */}
        {isTextLike && (
          <Section icon={<Type className="w-3.5 h-3.5" />} title="内容">
            <textarea
              defaultValue={selected.textContent}
              onChange={(e) => onApplyText(e.target.value)}
              placeholder="输入文本内容…"
              rows={3}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 resize-none"
            />
          </Section>
        )}

        {/* 位置 */}
        <Section icon={<Move className="w-3.5 h-3.5" />} title="位置">
          <div className="grid grid-cols-2 gap-2">
            <NumField
              label="Left"
              value={pxVal(s.left)}
              unit="px"
              onChange={(v) => onApplyStyle({ left: v + "px", position: s.position === "static" || !s.position ? "relative" : s.position })}
            />
            <NumField
              label="Top"
              value={pxVal(s.top)}
              unit="px"
              onChange={(v) => onApplyStyle({ top: v + "px", position: s.position === "static" || !s.position ? "relative" : s.position })}
            />
          </div>
          <div className="mt-2">
            <label className="text-[10px] text-zinc-500 mb-1 block">position</label>
            <select
              value={s.position}
              onChange={(e) => onApplyStyle({ position: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-brand-400"
            >
              {["static", "relative", "absolute", "fixed"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </Section>

        {/* 尺寸 */}
        <Section icon={<Maximize className="w-3.5 h-3.5" />} title="尺寸">
          <div className="grid grid-cols-2 gap-2">
            <NumField
              label="Width"
              value={pxVal(s.width)}
              unit="px"
              onChange={(v) => onApplyStyle({ width: v + "px" })}
            />
            <NumField
              label="Height"
              value={pxVal(s.height)}
              unit="px"
              onChange={(v) => onApplyStyle({ height: v + "px" })}
            />
          </div>
        </Section>

        {/* 排版 */}
        <Section icon={<Palette className="w-3.5 h-3.5" />} title="排版">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">字号</label>
                <input
                  type="text"
                  defaultValue={s.fontSize}
                  onChange={(e) => onApplyStyle({ fontSize: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">字重</label>
                <select
                  value={s.fontWeight}
                  onChange={(e) => onApplyStyle({ fontWeight: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-brand-400"
                >
                  {["normal", "bold", "300", "400", "500", "600", "700", "800"].map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">行高</label>
              <input
                type="text"
                defaultValue={s.lineHeight}
                onChange={(e) => onApplyStyle({ lineHeight: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">对齐</label>
              <div className="flex gap-1">
                {["left", "center", "right", "justify"].map((a) => (
                  <button
                    key={a}
                    onClick={() => onApplyStyle({ textAlign: a })}
                    className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-medium transition-colors ${
                      s.textAlign === a
                        ? "bg-brand-600 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {a === "justify" ? "两端" : a === "left" ? "左" : a === "center" ? "中" : "右"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 颜色 */}
        <Section icon={<Palette className="w-3.5 h-3.5" />} title="颜色">
          <div className="space-y-2">
            <ColorField label="文字颜色" value={s.color} onChange={(v) => onApplyStyle({ color: v })} />
            <ColorField label="背景颜色" value={s.backgroundColor} onChange={(v) => onApplyStyle({ backgroundColor: v })} />
          </div>
        </Section>

        {/* 盒模型 */}
        <Section icon={<Maximize className="w-3.5 h-3.5" />} title="盒模型">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">margin</label>
                <input
                  type="text"
                  defaultValue={s.margin}
                  onChange={(e) => onApplyStyle({ margin: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">padding</label>
                <input
                  type="text"
                  defaultValue={s.padding}
                  onChange={(e) => onApplyStyle({ padding: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">圆角</label>
                <input
                  type="text"
                  defaultValue={s.borderRadius}
                  onChange={(e) => onApplyStyle({ borderRadius: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">opacity</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  defaultValue={num(s.opacity)}
                  onChange={(e) => onApplyStyle({ opacity: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">border</label>
              <input
                type="text"
                defaultValue={s.border}
                onChange={(e) => onApplyStyle({ border: e.target.value })}
                placeholder="1px solid #ccc"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>
        </Section>

        {/* 自定义 HTML */}
        <Section icon={<Type className="w-3.5 h-3.5" />} title="内部 HTML">
          <textarea
            defaultValue={selected.innerHTML}
            onBlur={(e) => {
              try {
                onApplyHtml(e.target.value);
              } catch {
                /* ignore */
              }
            }}
            rows={4}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-[11px] font-mono text-zinc-800 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 resize-none"
            placeholder="<span>...</span>"
          />
          <p className="text-[10px] text-zinc-400 mt-1">编辑后会替换选中元素的内部 HTML。</p>
        </Section>
      </div>

      {/* 底部操作 */}
      <div className="shrink-0 px-3 py-3 border-t border-zinc-200 bg-zinc-50">
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          删除元素
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-zinc-100">
      <div className="flex items-center gap-1.5 mb-2 text-zinc-700">
        <span className="text-zinc-400">{icon}</span>
        <span className="text-xs font-medium">{title}</span>
      </div>
      {children}
    </div>
  );
}

function NumField({ label, value, unit, onChange }: { label: string; value: string; unit?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-zinc-500 mb-1 block">{label}</label>
      <div className="relative">
        <input
          type="number"
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-brand-400 pr-6"
        />
        {unit && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">{unit}</span>}
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  // 尝试从 rgb() 中解析颜色，否则直接用值
  const hexFromRgb = (rgb: string) => {
    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return "#000000";
    return "#" + [m[1], m[2], m[3]].map((n) => parseInt(n).toString(16).padStart(2, "0")).join("");
  };
  const isTransparent = value === "rgba(0, 0, 0, 0)" || value === "transparent";
  const hex = isTransparent ? "#ffffff" : hexFromRgb(value);

  return (
    <div>
      <label className="text-[10px] text-zinc-500 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-md border border-zinc-200 cursor-pointer shrink-0"
        />
        <input
          type="text"
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-brand-400"
        />
        {isTransparent && (
          <button
            onClick={() => onChange("transparent")}
            className="text-[10px] text-zinc-400 hover:text-zinc-600 shrink-0"
            title="保持透明"
          >
            透明
          </button>
        )}
      </div>
    </div>
  );
}
