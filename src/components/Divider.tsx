import { useEffect, useRef } from "react";

interface DividerProps {
  onResize: (deltaX: number) => void;
}

export function Divider({ onResize }: DividerProps) {
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      onResize(delta);
    };
    const handleUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [onResize]);

  const handleDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div onMouseDown={handleDown} className="shrink-0 w-1 cursor-col-resize bg-zinc-800/80 hover:bg-brand-500/60 active:bg-brand-500 transition-colors relative group">
      <div className="absolute inset-y-0 -left-1 -right-1 z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-brand-400/0 group-hover:bg-brand-400/40 transition-colors" />
    </div>
  );
}
