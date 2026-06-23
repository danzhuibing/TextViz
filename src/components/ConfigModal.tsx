import { useState } from "react";
import { X, Eye, EyeOff, Save, Bot, Image as ImageIcon } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { AppConfig } from "@/types";

export function ConfigModal() {
  const open = useStore((s) => s.configOpen);
  const setOpen = useStore((s) => s.setConfigOpen);
  const config = useStore((s) => s.config);
  const setConfig = useStore((s) => s.setConfig);

  const [form, setForm] = useState<AppConfig>(config);
  const [showKey, setShowKey] = useState(false);
  const [showVlmKey, setShowVlmKey] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    setConfig(form);
    setOpen(false);
  };

  const update = (patch: Partial<AppConfig>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white">配置</h2>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto scroll-thin">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center"><Bot className="w-4 h-4 text-brand-300" /></div>
              <div>
                <h3 className="text-sm font-medium text-white">LLM 配置</h3>
                <p className="text-[11px] text-zinc-500">用于 ReAct Agent 推理与代码生成</p>
              </div>
            </div>
            <div className="space-y-3">
              <Field label="Base URL" hint="OpenAI 兼容 API 地址">
                <input value={form.baseUrl} onChange={(e) => update({ baseUrl: e.target.value })} placeholder="https://api.siliconflow.cn/v1" className="input" />
              </Field>
              <Field label="API Key">
                <div className="relative">
                  <input type={showKey ? "text" : "password"} value={form.apiKey} onChange={(e) => update({ apiKey: e.target.value })} placeholder="sk-..." className="input pr-10" />
                  <button type="button" onClick={() => setShowKey((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">{showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </Field>
              <Field label="Model" hint="如 MiniMax/MiniMax-M3, gpt-4o-mini">
                <input value={form.model} onChange={(e) => update({ model: e.target.value })} placeholder="MiniMax/MiniMax-M3" className="input" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Max Tokens">
                  <input type="number" value={form.maxTokens} onChange={(e) => update({ maxTokens: Number(e.target.value) || 4096 })} min={512} max={32768} className="input" />
                </Field>
                <Field label="Max Turn" hint="ReAct 最大循环次数">
                  <input type="number" value={form.maxTurn} onChange={(e) => update({ maxTurn: Number(e.target.value) || 5 })} min={1} max={20} className="input" />
                </Field>
              </div>
            </div>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-emerald-300" /></div>
              <div>
                <h3 className="text-sm font-medium text-white">VLM 配置</h3>
                <p className="text-[11px] text-zinc-500">用于对生成结果进行视觉评审（支持图片输入的模型）</p>
              </div>
            </div>
            <div className="space-y-3">
              <Field label="Base URL">
                <input value={form.vlmBaseUrl} onChange={(e) => update({ vlmBaseUrl: e.target.value })} placeholder="https://api.siliconflow.cn/v1" className="input" />
              </Field>
              <Field label="API Key">
                <div className="relative">
                  <input type={showVlmKey ? "text" : "password"} value={form.vlmApiKey} onChange={(e) => update({ vlmApiKey: e.target.value })} placeholder="sk-..." className="input pr-10" />
                  <button type="button" onClick={() => setShowVlmKey((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">{showVlmKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </Field>
              <Field label="Model" hint="如 MiniMax/MiniMax-M3, gpt-4o">
                <input value={form.vlmModel} onChange={(e) => update({ vlmModel: e.target.value })} placeholder="MiniMax/MiniMax-M3" className="input" />
              </Field>
            </div>
          </section>

          <div className="rounded-lg bg-brand-950/40 border border-brand-500/20 p-3 text-[11px] text-zinc-400 leading-relaxed">
            配置保存在浏览器本地（localStorage），不会上传到服务器。VLM 与 LLM 可使用相同或不同的服务商。推荐使用硅基流动（SiliconFlow）的免费模型。
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-800 bg-zinc-950/40">
          <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">取消</button>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors"><Save className="w-3.5 h-3.5" />保存</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-medium text-zinc-300">{label}</span>
        {hint && <span className="text-[10px] text-zinc-600">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
