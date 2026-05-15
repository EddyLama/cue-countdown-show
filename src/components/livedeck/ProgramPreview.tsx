import { useEffect, useRef } from "react";
import { useLiveDeck } from "@/stores/liveDeckStore";
import { cn } from "@/lib/utils";

const Monitor = ({
  bus,
}: {
  bus: "pgm" | "pvw";
}) => {
  const { cameras, pgm, pvw, graphics, transition } = useLiveDeck();
  const camId = bus === "pgm" ? pgm : pvw;
  const cam = cameras.find((c) => c.id === camId);
  const isPgm = bus === "pgm";
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current && cam?.src) {
      ref.current.play().catch(() => {});
    }
  }, [cam?.src, cam?.id]);

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border",
          isPgm
            ? "bg-program/10 text-program border-program/30"
            : "bg-preview/10 text-preview border-preview/30"
        )}
      >
        <span className="w-2 h-2 rounded-full bg-current" />
        {isPgm ? "Program" : "Preview"}
        <span className="ml-auto font-mono text-[11px] text-foreground">{cam?.label ?? "—"}</span>
      </div>
      <div
        className={cn(
          "relative bg-black rounded-md overflow-hidden border-2 aspect-video",
          isPgm ? "border-program shadow-[0_0_24px_hsl(var(--program)/0.2)]" : "border-preview"
        )}
      >
        {cam?.alive && cam.src ? (
          <video
            ref={ref}
            src={cam.src}
            muted={!isPgm}
            loop
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={
              isPgm && transition.type === "mix" && transition.tbar > 0
                ? { opacity: 1 - transition.tbar / 200 }
                : undefined
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-mono">
            {cam?.alive ? "NO MEDIA — Import in Library" : "FEED LOST"}
          </div>
        )}

        {isPgm && graphics.show.lowerThird && (
          <div className="absolute bottom-6 left-4 right-1/3 bg-program/90 text-program-foreground px-4 py-2 rounded-sm font-semibold text-sm shadow-lg">
            {graphics.lowerThird}
          </div>
        )}
        {isPgm && graphics.logo && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 text-[10px] font-bold text-program tracking-widest">
            ◉ LIVE
          </div>
        )}
        {isPgm && graphics.show.ticker && (
          <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-xs py-1 overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-[ticker_20s_linear_infinite] pl-full">{graphics.ticker}</span>
          </div>
        )}
        {isPgm && graphics.show.slate && (
          <div className="absolute inset-0 bg-program/95 flex items-center justify-center text-program-foreground text-3xl font-bold tracking-widest">
            {graphics.slate}
          </div>
        )}
      </div>
    </div>
  );
};

export const ProgramPreview = () => (
  <div className="flex gap-3">
    <Monitor bus="pgm" />
    <Monitor bus="pvw" />
    <style>{`
      @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-100%); } }
    `}</style>
  </div>
);
