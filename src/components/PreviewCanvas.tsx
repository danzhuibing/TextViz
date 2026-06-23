import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import { Download, Maximize2, ZoomIn, ZoomOut, RotateCw, FileCode2, MousePointer2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import html2canvas from "html2canvas";
import { EDITOR_RUNTIME_SCRIPT } from "@/lib/editorRuntime";
import { EditPanel } from "@/components/EditPanel";
import type { SelectedElementInfo } from "@/types";

export interface PreviewCanvasHandle {
  takeScreenshot: () => Promise<string | null>;
}

interface PreviewCanvasProps {}

export const PreviewCanvas = forwardRef<PreviewCanvasHandle, PreviewCanvasProps>((_props, ref) => {
  const previewHtml = useStore((s) => s.previewHtml);
  const setPreviewHtml = useStore((s) => s.setPreviewHtml);
  const previewZoom = useStore((s) => s.previewZoom);
  const setPreviewZoom = useStore((s) => s.setPreviewZoom);
  const setSelectedElement = useStore((s) => s.setSelectedElement);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // 标记：本次 previewHtml 变更来自编辑器同步，不需要重置 srcdoc
  const skipSrcDocRef = useRef(false);
  // 编辑模式开关
  const editModeRef = useRef(true);

  // 设置 srcdoc
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (skipSrcDocRef.current) {
      skipSrcDocRef.current = false;
      return;
    }
    iframe.srcdoc = previewHtml || "";
  }, [previewHtml]);

  // 注入编辑器运行时脚本
  const injectEditor = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const doc = iframe.contentDocument;
    if (doc.getElementById("__tv-editor-script")) return;
    const script = doc.createElement("script");
    script.id = "__tv-editor-script";
    script.textContent = EDITOR_RUNTIME_SCRIPT;
    doc.body.appendChild(script);
  }, []);

  const handleIframeLoad = useCallback(() => {
    injectEditor();
  }, [injectEditor]);

  // 监听来自 iframe 的消息
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const data = e.data;
      if (!data || data.source !== "textviz-editor") return;
      const iframe = iframeRef.current;
      if (!iframe || e.source !== iframe.contentWindow) return;

      if (data.type === "selected") {
        setSelectedElement(data.payload as SelectedElementInfo);
      } else if (data.type === "deselected") {
        setSelectedElement(null);
      } else if (data.type === "changed") {
        // 从 iframe 同步最新 HTML 到 store（不触发 srcdoc 重置）
        const doc = iframe.contentDocument;
        if (doc) {
          // 克隆并清理编辑器残留元素，避免污染导出的 HTML
          const clone = doc.documentElement.cloneNode(true) as HTMLElement;
          clone.querySelectorAll("#__tv-container, #__tv-editor-script, script#__tv-editor-script").forEach((el) => el.remove());
          clone.querySelectorAll("[data-tv-id]").forEach((el) => el.removeAttribute("data-tv-id"));
          skipSrcDocRef.current = true;
          setPreviewHtml("<!DOCTYPE html>\n" + clone.outerHTML);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [setPreviewHtml, setSelectedElement]);

  // 向 iframe 发送消息
  const postToIframe = useCallback((type: string, payload: unknown) => {
    const iframe = iframeRef.current;
    iframe?.contentWindow?.postMessage({ source: "textviz-parent", type, payload }, "*");
  }, []);

  const handleApplyStyle = useCallback((styles: Record<string, string>) => {
    postToIframe("apply-style", { styles });
  }, [postToIframe]);

  const handleApplyText = useCallback((text: string) => {
    postToIframe("apply-text", { text });
  }, [postToIframe]);

  const handleApplyHtml = useCallback((html: string) => {
    postToIframe("apply-html", { html });
  }, [postToIframe]);

  const handleDelete = useCallback(() => {
    postToIframe("delete", {});
    setSelectedElement(null);
  }, [postToIframe, setSelectedElement]);

  const handleReplaceSvg = useCallback((dataUrl: string) => {
    postToIframe("replace-with-image", { dataUrl });
  }, [postToIframe]);

  useImperativeHandle(ref, () => ({
    takeScreenshot: async () => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument?.body) return null;
      try {
        const doc = iframe.contentDocument;
        await new Promise((r) => setTimeout(r, 500));
        const canvas = await html2canvas(doc.body, {
          backgroundColor: "#ffffff",
          scale: 1,
          useCORS: true,
          logging: false,
          width: 800,
          windowWidth: 800,
        });
        return canvas.toDataURL("image/png").split(",")[1];
      } catch (err) {
        console.error("截图失败", err);
        return null;
      }
    },
  }));

  const handleDownload = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `textviz-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = previewHtml || "";
  };

  const handleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await el.requestFullscreen();
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-zinc-100 relative">
      <div className="shrink-0 h-12 flex items-center justify-between px-4 border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-brand-600" />
          <span className="text-sm font-medium text-zinc-700">预览画布</span>
          {previewHtml && <span className="text-[11px] text-zinc-400 ml-2">800px · self-contained HTML</span>}
          {editModeRef.current && previewHtml && (
            <span className="ml-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-50 border border-brand-200 text-[10px] text-brand-600 font-medium">
              <MousePointer2 className="w-2.5 h-2.5" />
              编辑模式
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 mr-2 rounded-lg border border-zinc-200 bg-zinc-50">
            <button onClick={() => setPreviewZoom(Math.max(0.3, previewZoom - 0.1))} disabled={!previewHtml} className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-brand-600 disabled:opacity-30 transition-colors" title="缩小"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-[11px] text-zinc-500 w-10 text-center tabular-nums">{Math.round(previewZoom * 100)}%</span>
            <button onClick={() => setPreviewZoom(Math.min(2, previewZoom + 0.1))} disabled={!previewHtml} className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-brand-600 disabled:opacity-30 transition-colors" title="放大"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>
          <button onClick={handleRefresh} disabled={!previewHtml} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-brand-600 hover:bg-zinc-100 disabled:opacity-30 transition-colors" title="刷新"><RotateCw className="w-4 h-4" /></button>
          <button onClick={handleDownload} disabled={!previewHtml} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-brand-600 hover:bg-zinc-100 disabled:opacity-30 transition-colors" title="下载 HTML"><Download className="w-4 h-4" /></button>
          <button onClick={handleFullscreen} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-brand-600 hover:bg-zinc-100 transition-colors" title="全屏"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-zinc-200/60 flex items-start justify-center p-6">
        {previewHtml ? (
          <div style={{ transform: `scale(${previewZoom})`, transformOrigin: "top center", transition: "transform 0.15s ease-out" }} className="shadow-2xl shadow-zinc-400/40 rounded-lg overflow-hidden bg-white">
            <iframe
              ref={iframeRef}
              title="preview"
              className="w-[800px] h-[1200px] border-0 block bg-white"
              sandbox="allow-same-origin allow-scripts"
              onLoad={handleIframeLoad}
            />
          </div>
        ) : (
          <EmptyCanvas />
        )}
      </div>

      <EditPanel
        onApplyStyle={handleApplyStyle}
        onApplyText={handleApplyText}
        onApplyHtml={handleApplyHtml}
        onDelete={handleDelete}
        onReplaceSvg={handleReplaceSvg}
      />
    </div>
  );
});

PreviewCanvas.displayName = "PreviewCanvas";

function EmptyCanvas() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center">
      <div className="w-24 h-32 rounded-xl border-2 border-dashed border-zinc-300 flex items-center justify-center mb-4 bg-white/50">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="6" width="32" height="36" rx="3" fill="#E5E7EB" />
          <rect x="12" y="10" width="24" height="3" rx="1.5" fill="#9CA3AF" />
          <rect x="12" y="16" width="16" height="2" rx="1" fill="#D1D5DB" />
          <rect x="12" y="22" width="24" height="8" rx="2" fill="#7C3AED" opacity="0.3" />
          <rect x="12" y="34" width="20" height="2" rx="1" fill="#D1D5DB" />
          <rect x="12" y="38" width="14" height="2" rx="1" fill="#D1D5DB" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-zinc-500 mb-1">预览画布</h3>
      <p className="text-xs text-zinc-400 max-w-[280px] leading-relaxed">在左侧粘贴文本并发送后，AI 生成的内容将在这里实时渲染</p>
      <p className="text-[11px] text-zinc-400/70 max-w-[280px] leading-relaxed mt-2">生成后可点击画布上的元素进行编辑</p>
    </div>
  );
}
