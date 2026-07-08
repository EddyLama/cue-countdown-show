interface MeterProps {
  value: number; // 0-100
  peak?: number; // 0-100
  height?: number;
  width?: number;
}

/** Vertical broadcast-style peak meter with peak-hold tick. */
export const Meter = ({ value, peak, height = 140, width = 8 }: MeterProps) => {
  const fill = Math.max(0, Math.min(100, value));
  const peakY = peak != null ? Math.max(0, Math.min(100, peak)) : null;

  return (
    <div
      className="relative neo-inset overflow-hidden"
      style={{ width, height, borderRadius: 3, padding: 0 }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 transition-[height] duration-75"
        style={{
          height: `${fill}%`,
          background:
            "linear-gradient(to top, hsl(var(--preview)) 0%, hsl(var(--preview)) 55%, hsl(var(--cue)) 75%, hsl(var(--cue)) 88%, hsl(var(--program)) 100%)",
        }}
      />
      {peakY != null && peakY > 1 && (
        <div
          className="absolute left-0 right-0 h-px bg-white/90"
          style={{ bottom: `${peakY}%`, boxShadow: "0 0 4px white" }}
        />
      )}
      {/* subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to top, transparent 0 10%, hsl(0 0% 0% / 0.4) 10% calc(10% + 1px))",
        }}
      />
    </div>
  );
};
