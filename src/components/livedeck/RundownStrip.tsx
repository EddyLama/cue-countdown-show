import { useEffect, useState } from "react";
import { useLiveDeck } from "@/stores/liveDeckStore";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmt = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.max(0, s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

export const RundownStrip = () => {
  const { rundown, startCue, advanceCue } = useLiveDeck();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(i);
  }, []);

  const activeCue = rundown.cues.find((c) => c.id === rundown.activeCueId);
  const remaining = activeCue && rundown.cueStartedAt
    ? activeCue.durationSec - Math.floor((now - rundown.cueStartedAt) / 1000)
    : 0;

  return (
    <aside className="w-64 border-l border-border bg-panel flex flex-col shrink-0">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rundown</div>
          <div className="text-xs font-mono text-foreground mt-0.5">{rundown.cues.length} cues</div>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={advanceCue}>
          NEXT <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {rundown.cues.map((c, i) => {
          const active = c.id === rundown.activeCueId;
          const warn = active && remaining <= 10;
          return (
            <button
              key={c.id}
              onClick={() => startCue(c.id)}
              className={cn(
                "w-full text-left px-5 py-3 border-l-[3px] transition-colors",
                active ? "bg-cue/8 border-cue" : "border-transparent hover:bg-secondary/40",
                c.done && !active && "opacity-40"
              )}
            >
              <div className="text-[9px] font-mono font-bold text-muted-foreground tracking-wider">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="text-xs font-medium mt-1 leading-tight">{c.title}</div>
              <div
                className={cn(
                  "text-sm font-mono font-bold mt-1",
                  warn ? "text-program animate-pulse" : "text-cue"
                )}
              >
                {active ? fmt(remaining) : fmt(c.durationSec)}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
