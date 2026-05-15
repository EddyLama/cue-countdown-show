import { useLiveDeck } from "@/stores/liveDeckStore";
import { cn } from "@/lib/utils";
import { VideoOff } from "lucide-react";

interface Props {
  cols?: number;
  compact?: boolean;
}

export const MultiViewWall = ({ cols = 3, compact = false }: Props) => {
  const { cameras, pgm, pvw, setPreview } = useLiveDeck();
  return (
    <div
      className={cn("grid gap-2", compact ? "" : "p-3")}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {cameras.map((cam) => {
        const isPgm = cam.id === pgm;
        const isPvw = cam.id === pvw;
        return (
          <button
            key={cam.id}
            onClick={() => setPreview(cam.id)}
            className={cn(
              "relative aspect-video rounded-md overflow-hidden border-2 bg-black/80 group transition-all",
              isPgm && "border-program shadow-[0_0_0_1px_hsl(var(--program)),0_4px_14px_hsl(var(--program)/0.3)]",
              isPvw && !isPgm && "border-preview shadow-[0_0_0_1px_hsl(var(--preview)),0_4px_14px_hsl(var(--preview)/0.25)]",
              !isPgm && !isPvw && "border-border hover:border-muted-foreground"
            )}
          >
            {cam.alive && cam.src ? (
              <video
                src={cam.src}
                muted
                loop
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                {cam.alive ? (
                  <span className="text-[10px] font-mono">NO SIGNAL</span>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-program">
                    <VideoOff className="w-5 h-5" />
                    <span className="text-[9px] font-mono font-bold">FEED LOST</span>
                  </div>
                )}
              </div>
            )}

            {(isPgm || isPvw) && (
              <span
                className={cn(
                  "absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono tracking-wider",
                  isPgm ? "bg-program text-program-foreground" : "bg-preview text-preview-foreground"
                )}
                style={isPgm ? { animation: "tally-blink 1.4s infinite" } : undefined}
              >
                {isPgm ? "ON AIR" : "PVW"}
              </span>
            )}
            <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold font-mono text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {cam.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
