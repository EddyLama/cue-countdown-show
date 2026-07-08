import { useCallback, useRef } from "react";

interface FaderProps {
  value: number; // 0-100
  onChange: (v: number) => void;
  height?: number;
  color?: string; // css color
  ticks?: number[]; // percentage positions
}

const DEFAULT_TICKS = [0, 15, 30, 45, 60, 75, 90, 100];

export const Fader = ({ value, onChange, height = 140, ticks = DEFAULT_TICKS }: FaderProps) => {
  const startRef = useRef<{ y: number; v: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { y: e.clientY, v: value };
  };
  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current || !trackRef.current) return;
      const h = trackRef.current.clientHeight - 24;
      const dy = startRef.current.y - e.clientY;
      let next = startRef.current.v + (dy / h) * 100;
      // detent at 75 (0dB)
      if (Math.abs(next - 75) < 1.5) next = 75;
      next = Math.max(0, Math.min(100, next));
      onChange(next);
    },
    [onChange]
  );
  const onUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    startRef.current = null;
  };
  const onDbl = () => onChange(75);

  const capH = 22;
  const y = (1 - value / 100) * (height - capH);

  return (
    <div
      ref={trackRef}
      className="relative neo-fader-track"
      style={{ width: 22, height }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onDoubleClick={onDbl}
    >
      {ticks.map((t) => (
        <span
          key={t}
          className="absolute left-full ml-1 h-px w-1.5 bg-muted-foreground/50"
          style={{ top: `${(1 - t / 100) * (height - capH) + capH / 2}px` }}
        />
      ))}
      {/* 0dB marker */}
      <span
        className="absolute left-full ml-0.5 h-px w-2 bg-cue"
        style={{ top: `${(1 - 75 / 100) * (height - capH) + capH / 2}px` }}
      />
      <div
        className="neo-fader-cap absolute cursor-ns-resize touch-none"
        style={{ top: y, left: -3, width: 28, height: capH }}
      />
    </div>
  );
};
