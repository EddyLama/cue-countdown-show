import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useLiveDeck } from "@/stores/liveDeckStore";
import { Button } from "@/components/ui/button";
import { Layers, Timer, Tv2, GraduationCap, BarChart3, FolderOpen, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const fmtClock = (ms: number) => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600).toString().padStart(2, "0");
  const m = Math.floor((t % 3600) / 60).toString().padStart(2, "0");
  const s = (t % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};
const fmtSeg = (ms: number) => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(t / 60).toString().padStart(2, "0");
  const s = (t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const tabs = [
  { to: "/", label: "Timer", icon: Timer },
  { to: "/livedeck", label: "LiveDeck", icon: Tv2 },
  { to: "/library", label: "Library", icon: FolderOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export const AppHeader = () => {
  const { pgm, cameras, trainer, toggleTrainerPanel, session, rundown } = useLiveDeck();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(i);
  }, []);

  const showMs = now - session.startedAt;
  const segMs = rundown.cueStartedAt ? now - rundown.cueStartedAt : 0;
  const onAir = cameras.find((c) => c.id === pgm)?.label ?? "—";
  const location = useLocation();

  return (
    <header className="h-14 bg-panel border-b border-border flex items-center gap-4 px-4 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-program to-program/70 flex items-center justify-center shadow-[0_2px_8px_hsl(var(--program)/0.4)]">
          <Radio className="w-4 h-4 text-program-foreground" />
        </div>
        <div className="font-bold text-sm tracking-tight">
          LIVE<span className="text-program">DECK</span> PRO
        </div>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2 text-program text-[11px] font-bold tracking-wider">
        <span className="w-2 h-2 rounded-full bg-program live-dot shadow-[0_0_8px_hsl(var(--program))]" />
        LIVE
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-5">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Show</span>
          <span className="font-mono text-base font-semibold leading-none">{fmtClock(showMs)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Segment</span>
          <span className="font-mono text-sm font-semibold text-preview leading-none">{fmtSeg(segMs)}</span>
        </div>
      </div>

      <nav className="flex items-center gap-1 ml-6">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = location.pathname === t.to;
          return (
            <NavLink
              key={t.to}
              to={t.to}
              className={cn(
                "flex items-center gap-1.5 px-3 h-9 rounded-md text-xs font-medium transition-colors",
                active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2 px-3 h-9 rounded-md bg-program/10 border border-program/30">
        <span className="text-[9px] uppercase font-bold tracking-widest text-program">On Air</span>
        <span className="font-mono text-xs font-semibold">{onAir}</span>
      </div>

      <div className="flex items-center gap-2 px-3 h-9 rounded-md bg-cue/10 border border-cue/30">
        <span className="text-[9px] uppercase font-bold tracking-widest text-cue">Score</span>
        <span className="font-mono text-sm font-bold text-cue">{trainer.score.value}</span>
      </div>

      <Button
        size="sm"
        onClick={toggleTrainerPanel}
        className={cn(
          "gap-1.5 h-9",
          trainer.panelOpen
            ? "bg-cue text-cue-foreground hover:bg-cue/90"
            : "bg-trainer text-trainer-foreground hover:bg-trainer/90"
        )}
      >
        <GraduationCap className="w-3.5 h-3.5" />
        Trainer
      </Button>
    </header>
  );
};
