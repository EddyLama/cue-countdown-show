import { useEffect } from "react";
import { useLiveDeck } from "@/stores/liveDeckStore";
import { cn } from "@/lib/utils";

export const AudioMixer = () => {
  const { audio, setChannelLevel, toggleMute, toggleSolo, setMaster, tickVU } = useLiveDeck();

  useEffect(() => {
    const i = setInterval(tickVU, 80);
    return () => clearInterval(i);
  }, [tickVU]);

  const Channel = ({
    id,
    label,
    level,
    mute,
    solo,
    vu,
    isMaster,
  }: {
    id: string;
    label: string;
    level: number;
    mute?: boolean;
    solo?: boolean;
    vu: number;
    isMaster?: boolean;
  }) => (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 h-full">
      <span className={cn("text-[9px] font-bold uppercase tracking-widest", isMaster ? "text-cue" : "text-muted-foreground")}>
        {label}
      </span>
      <div className="w-full h-1.5 bg-background rounded-sm overflow-hidden border border-border">
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${vu}%`,
            background:
              "linear-gradient(90deg, hsl(var(--preview)) 0%, hsl(var(--preview)) 65%, hsl(var(--cue)) 82%, hsl(var(--program)) 100%)",
          }}
        />
      </div>
      <div className="flex-1 flex items-center justify-center w-full min-h-0 py-1">
        <input
          type="range"
          min={0}
          max={100}
          value={level}
          onChange={(e) =>
            isMaster ? setMaster(Number(e.target.value)) : setChannelLevel(id, Number(e.target.value))
          }
          className="fader-vertical h-full"
          style={{ accentColor: isMaster ? "hsl(var(--cue))" : "hsl(var(--trainer))" }}
        />
      </div>
      <span className="font-mono text-[10px] font-bold">{level}</span>
      {!isMaster && (
        <div className="flex gap-1 w-full">
          <button
            onClick={() => toggleMute(id)}
            className={cn(
              "flex-1 h-5 rounded text-[8px] font-bold border tracking-wider",
              mute ? "bg-program text-program-foreground border-program" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            M
          </button>
          <button
            onClick={() => toggleSolo(id)}
            className={cn(
              "flex-1 h-5 rounded text-[8px] font-bold border tracking-wider",
              solo ? "bg-cue text-cue-foreground border-cue" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            S
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-panel-elev border border-border rounded-lg p-3 flex flex-col gap-2 h-44">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Audio Console</span>
        <span className="text-[10px] font-mono text-muted-foreground">{audio.channels.length} CH + MASTER</span>
      </div>
      <div className="flex gap-3 flex-1 min-h-0">
        {audio.channels.map((c) => (
          <Channel key={c.id} {...c} vu={c.vu} />
        ))}
        <div className="w-px bg-border" />
        <Channel id="master" label="Master" level={audio.master} vu={audio.master} isMaster />
      </div>
    </div>
  );
};
