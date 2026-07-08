import { useLiveDeck } from "@/stores/liveDeckStore";
import { PanelFrame } from "./hardware/PanelFrame";
import { Led } from "./hardware/Led";
import { cn } from "@/lib/utils";

/** Bus rows only — transition controls moved to TransitionPanel. */
export const SwitcherPanel = () => {
  const { cameras, pgm, pvw, setPreview } = useLiveDeck();

  const Row = ({
    label, activeId, onPick, color,
  }: {
    label: string; activeId: string;
    onPick?: (id: string) => void;
    color: "program" | "preview";
  }) => (
    <div className="flex items-center gap-1.5">
      <div className={cn(
        "w-14 text-[10px] font-hw font-bold tracking-widest font-mono shrink-0 text-center py-1.5 rounded",
        color === "program" ? "bg-program/10 text-program border border-program/30"
                            : "bg-preview/10 text-preview border border-preview/30"
      )}>
        {label}
      </div>
      {cameras.map((c) => {
        const active = c.id === activeId;
        return (
          <button
            key={c.id}
            disabled={!c.alive}
            onClick={() => onPick?.(c.id)}
            data-pressed={active}
            className={cn(
              "neo-button flex-1 h-10 font-mono text-[13px] flex flex-col items-center justify-center gap-0.5",
              active && color === "program" && "text-program",
              active && color === "preview" && "text-preview",
              !c.alive && "opacity-40 cursor-not-allowed"
            )}
            style={active ? {
              boxShadow: `inset 0 2px 4px hsl(0 0% 0%/0.9), 0 0 12px hsl(var(--${color})/0.5), inset 0 0 0 1px hsl(var(--${color})/0.5)`,
            } : undefined}
          >
            <Led on={active} color={color === "program" ? "red" : "green"} size={5} pulse={active && color === "program"} />
            <span className="leading-none font-bold">{c.label.replace("CAM ", "")}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <PanelFrame title="M/E Switcher — Bus" bodyClassName="p-3 space-y-2">
      <Row label="PGM" activeId={pgm} color="program" />
      <Row label="PVW" activeId={pvw} onPick={setPreview} color="preview" />
    </PanelFrame>
  );
};
