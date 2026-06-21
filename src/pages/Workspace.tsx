import { useRef } from "react";
import { useStore } from "@/store/useStore";
import { ChatPanel } from "@/components/ChatPanel";
import { Divider } from "@/components/Divider";
import { PreviewCanvas, type PreviewCanvasHandle } from "@/components/PreviewCanvas";
import { ConfigModal } from "@/components/ConfigModal";
import { RequestLogPanel } from "@/components/RequestLogPanel";

export default function Workspace() {
  const leftPanelWidth = useStore((s) => s.leftPanelWidth);
  const setLeftPanelWidth = useStore((s) => s.setLeftPanelWidth);
  const logPanelOpen = useStore((s) => s.logPanelOpen);
  const previewRef = useRef<PreviewCanvasHandle>(null);

  const handleResize = (deltaX: number) => {
    setLeftPanelWidth(leftPanelWidth + deltaX);
  };

  const takeScreenshot = async () => {
    return (await previewRef.current?.takeScreenshot()) ?? null;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      <div style={{ width: leftPanelWidth }} className={`shrink-0 h-full min-w-[280px] ${logPanelOpen ? "pb-72" : ""}`}>
        <ChatPanel takeScreenshot={takeScreenshot} />
      </div>
      <Divider onResize={handleResize} />
      <div className={`flex-1 h-full min-w-[400px] ${logPanelOpen ? "pb-72" : ""}`}>
        <PreviewCanvas ref={previewRef} />
      </div>
      <ConfigModal />
      <RequestLogPanel />
    </div>
  );
}
