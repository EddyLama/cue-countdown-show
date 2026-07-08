import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface KnobProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  size?: number;
  label?: string;
  unit?: string;
  color?: "trainer" | "cue" | "program" | "preview";
  center?: boolean; // bipolar (e.g., EQ / pan)
  defaultValue?: number;
  format?: (v: number) => string;
}

export const Knob = ({
  value,
  min = 0,
  max = 100,
  onChange,
  size = 44,
  label,
  unit,
  color = "trainer",
  center = false,
  defaultValue,
  format,
}: KnobProps) => {
  const startRef = useRef<{ y: number; v: number } | null>(null);

  const norm = (value - min) / (max - min);
  const angle = -135 + norm * 270;
  const fillPct = center ? Math.abs(norm - 0.5) * 100 : norm * 100;

  const onDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      startRef.current = { y: e.clientY, v: value };
    },
    [value]
  );

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current) return;
      const dy = startRef.current.y - e.clientY;
      const range = max - min;
      const scale = e.shiftKey ? range / 400 : range / 120;
      let next = startRef.current.v + dy * scale;
      next = Math.max(min, Math.min(max, next));
      onChange(next);
    },
    [max, min, onChange]
  );

  const onUp = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    startRef.current = null;
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const step = (max - min) / (e.shiftKey ? 400 : 60);
      onChange(Math.max(min, Math.min(max, value - Math.sign(e.deltaY) * step)));
    },
    [max, min, onChange, value]
  );

  const onDbl = () => {
    if (defaultValue !== undefined) onChange(defaultValue);
  };

  const display = format
    ? format(value)
    : `${value >= 0 && center ? "+" : ""}${value.toFixed(0)}${unit ?? ""}`;

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      {label && (
        <span className="text-[8px] font-hw font-bold uppercase text-muted-foreground leading-none">
          {label}
        </span>
      )}
      <div
        className={cn("relative touch-none cursor-ns-resize")}
        style={{
          width: size,
          height: size,
          ["--knob-color" as any]: `var(--${color})`,
          ["--knob-fill" as any]: `${fillPct}%`,
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
        onDoubleClick={onDbl}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        <div className="neo-knob-ring" />
        <div className="neo-knob-body absolute inset-0">
          <div
            className="neo-knob-indicator"
            style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
          />
        </div>
      </div>
      <span className="text-[9px] font-mono text-muted-foreground leading-none tabular-nums">
        {display}
      </span>
    </div>
  );
};
