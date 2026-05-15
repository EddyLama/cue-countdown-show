import { useLiveDeck, type SessionEvent } from "@/stores/liveDeckStore";
import { Button } from "@/components/ui/button";
import { CHALLENGE_PACKS, DIFFICULTY_COLORS, type ChallengeAction } from "@/data/challengePacks";
import { cn } from "@/lib/utils";
import { X, Zap, AlertTriangle, VolumeX, ImageOff, Clock, EyeOff, Film } from "lucide-react";

const ACTION_ICONS: Record<ChallengeAction["kind"], typeof Zap> = {
  "kill-camera": EyeOff,
  "wrong-graphic": ImageOff,
  "audio-dropout": VolumeX,
  "force-mute": VolumeX,
  "early-cue": Clock,
  "lose-tally": AlertTriangle,
  "stinger-fail": Film,
};

export const TrainerPanel = () => {
  const {
    trainer,
    toggleTrainerPanel,
    cameras,
    killCamera,
    reviveCamera,
    toggleMute,
    pushEvent,
    adjustScore,
    advanceCue,
    setLowerThird,
    toggleGraphic,
    resetSession,
  } = useLiveDeck();

  const fire = (action: ChallengeAction) => {
    pushEvent({
      type: "challenge",
      message: `⚡ ${action.label} — ${action.description}`,
      level: "challenge",
    });
    adjustScore(-3, "challenge fired");
    switch (action.kind) {
      case "kill-camera": {
        const alive = cameras.filter((c) => c.alive);
        const target = alive[Math.floor(Math.random() * alive.length)];
        if (target) {
          killCamera(target.id);
          setTimeout(() => reviveCamera(target.id), 12000);
        }
        break;
      }
      case "audio-dropout":
      case "force-mute": {
        const ch = (action.payload?.ch as string) ?? "ch1";
        toggleMute(ch);
        setTimeout(() => toggleMute(ch), 8000);
        break;
      }
      case "wrong-graphic":
        setLowerThird("⚠ TYPO: Jhon Doh — Producre");
        toggleGraphic("lowerThird");
        setTimeout(() => toggleGraphic("lowerThird"), 6000);
        break;
      case "early-cue":
        advanceCue();
        break;
      case "lose-tally":
      case "stinger-fail":
        // visual log only
        break;
    }
  };

  const QUICK: ChallengeAction[] = [
    { kind: "kill-camera", label: "Kill random CAM", description: "Random camera feed dies" },
    { kind: "audio-dropout", label: "Audio dropout MIC 1", description: "MIC 1 drops", payload: { ch: "ch1" } },
    { kind: "wrong-graphic", label: "Wrong graphic on air", description: "Bad lower-third" },
    { kind: "early-cue", label: "Early cue", description: "Director jumps ahead" },
    { kind: "force-mute", label: "Force mute GTR", description: "Channel hijacked", payload: { ch: "ch3" } },
    { kind: "stinger-fail", label: "Stinger fail", description: "Transition glitch" },
  ];

  const eventStyles: Record<NonNullable<SessionEvent["level"]>, string> = {
    info: "border-border",
    ok: "border-preview",
    error: "border-program",
    challenge: "border-cue",
  };

  return (
    <aside
      className={cn(
        "fixed top-14 bottom-0 right-0 w-96 bg-panel border-l border-border z-30 flex flex-col transition-transform duration-300 shadow-[-12px_0_24px_rgba(0,0,0,0.3)]",
        trainer.panelOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="bg-gradient-to-br from-trainer to-trainer/70 px-5 py-4 flex items-center justify-between">
        <div className="text-sm font-bold text-trainer-foreground tracking-wide">TRAINER CONSOLE</div>
        <button
          onClick={toggleTrainerPanel}
          className="w-8 h-8 rounded-md bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 py-4 border-b border-border grid grid-cols-3 gap-2">
        {[
          { l: "Score", v: trainer.score.value },
          { l: "Takes", v: trainer.score.takes },
          { l: "Errors", v: trainer.score.errors },
        ].map((s) => (
          <div key={s.l} className="bg-secondary/50 border border-border p-3 rounded-md text-center">
            <div className="font-mono text-2xl font-bold text-cue leading-none">{s.v}</div>
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mt-1.5">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Quick Inject</h3>
        <div className="grid grid-cols-2 gap-2">
          {QUICK.map((a) => {
            const Icon = ACTION_ICONS[a.kind];
            return (
              <button
                key={a.label}
                onClick={() => fire(a)}
                className="flex items-center gap-2 p-2.5 bg-secondary/50 hover:bg-secondary border border-border hover:border-trainer rounded-md text-left text-[11px] transition-all"
              >
                <span className="w-7 h-7 rounded bg-trainer/15 text-trainer flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="leading-tight">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Challenge Packs</h3>
        <div className="space-y-1.5">
          {CHALLENGE_PACKS.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-secondary/50 border border-border rounded-md p-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">{p.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{p.scenario}</div>
              </div>
              <span className={cn("text-[9px] uppercase tracking-wider font-bold border rounded px-1.5 py-0.5", DIFFICULTY_COLORS[p.difficulty])}>
                {p.difficulty}
              </span>
            </div>
          ))}
        </div>
        <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-[10px]" onClick={resetSession}>
          Reset Session
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Session Log</h3>
        {trainer.events.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-6">No events yet — fire a challenge.</div>
        )}
        {trainer.events.map((e) => (
          <div
            key={e.id}
            className={cn("border-l-[3px] bg-secondary/40 rounded-r-md mb-1.5 px-3 py-2", eventStyles[e.level ?? "info"])}
          >
            <div className="text-[9px] font-mono text-muted-foreground font-semibold">
              {(e.t / 1000).toFixed(1)}s · {e.type}
            </div>
            <div className="text-[11px] leading-snug">{e.message}</div>
          </div>
        ))}
      </div>
    </aside>
  );
};
