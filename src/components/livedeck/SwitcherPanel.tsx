import { useLiveDeck, type TransitionType } from "@/stores/liveDeckStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TRANSITIONS: TransitionType[] = ["cut", "mix", "wipe", "dve", "sting"];

export const SwitcherPanel = () => {
  const { cameras, pgm, pvw, setPreview, take, transition, setTransitionType, setTransitionDuration, setTbar } =
    useLiveDeck();

  return (
    <div className="bg-panel-elev border border-border rounded-lg p-3 flex flex-col gap-3">
      {/* PGM bus */}
      <div className="flex items-center gap-1.5">
        <div className="w-12 text-[10px] font-bold tracking-wider text-program font-mono shrink-0">PGM</div>
        {cameras.map((c) => {
          const active = c.id === pgm;
          return (
            <button
              key={c.id}
              disabled={!c.alive}
              className={cn(
                "flex-1 h-9 rounded-md font-mono text-[12px] font-bold border transition-all",
                active
                  ? "bg-program text-program-foreground border-program shadow-[0_0_12px_hsl(var(--program)/0.5)]"
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground",
                !c.alive && "opacity-40 cursor-not-allowed"
              )}
            >
              {c.label.replace("CAM ", "")}
            </button>
          );
        })}
      </div>

      {/* PVW bus */}
      <div className="flex items-center gap-1.5">
        <div className="w-12 text-[10px] font-bold tracking-wider text-preview font-mono shrink-0">PVW</div>
        {cameras.map((c) => {
          const active = c.id === pvw;
          return (
            <button
              key={c.id}
              disabled={!c.alive}
              onClick={() => setPreview(c.id)}
              className={cn(
                "flex-1 h-9 rounded-md font-mono text-[12px] font-bold border transition-all",
                active
                  ? "bg-preview/20 text-preview border-preview"
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground",
                !c.alive && "opacity-40 cursor-not-allowed"
              )}
            >
              {c.label.replace("CAM ", "")}
            </button>
          );
        })}
      </div>

      {/* Transitions row */}
      <div className="flex items-center gap-3 pt-3 border-t border-border">
        <div className="flex gap-1 bg-background p-1 rounded-md border border-border">
          {TRANSITIONS.map((t) => (
            <button
              key={t}
              onClick={() => setTransitionType(t)}
              className={cn(
                "h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-colors",
                transition.type === t
                  ? "bg-trainer text-trainer-foreground shadow-[0_1px_6px_hsl(var(--trainer)/0.4)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1">
          <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">T-Bar</span>
          <input
            type="range"
            min={0}
            max={100}
            value={transition.tbar}
            onChange={(e) => setTbar(Number(e.target.value))}
            onMouseUp={(e) => {
              if (Number((e.target as HTMLInputElement).value) > 50) setTbar(100);
              else setTbar(0);
            }}
            className="flex-1 h-1.5 accent-trainer"
          />
          <span className="text-[10px] font-mono text-muted-foreground w-10 text-center">
            {(transition.durationMs / 1000).toFixed(1)}s
          </span>
          <input
            type="range"
            min={200}
            max={3000}
            step={100}
            value={transition.durationMs}
            onChange={(e) => setTransitionDuration(Number(e.target.value))}
            className="w-20 h-1 accent-muted-foreground"
          />
        </div>

        <Button
          onClick={take}
          className="h-10 px-7 bg-program hover:bg-program/90 text-program-foreground font-bold tracking-widest text-sm shadow-[0_3px_14px_hsl(var(--program)/0.4)]"
        >
          TAKE
        </Button>
      </div>
    </div>
  );
};
