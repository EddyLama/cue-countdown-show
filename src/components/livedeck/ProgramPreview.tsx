import { useEffect, useRef } from "react";
import { useLiveDeck } from "@/stores/liveDeckStore";
import { runTransition, TransitionSpec } from "@/lib/transitionEngine";
import { cn } from "@/lib/utils";

/**
 * Program monitor uses two absolutely-stacked <video> layers.
 * On TAKE, the store publishes pending swap → we run compositor animation → commit swap.
 */

type Bus = "pgm" | "pvw";

const StingLayer = () => (
  <div
    data-sting-root
    className="absolute inset-0 pointer-events-none opacity-0"
    style={{ transition: "opacity 60ms linear" }}
  >
    {/* Bars sting */}
    <div className="absolute inset-0" data-sting-variant="bars"
      style={{
        background:
          "repeating-linear-gradient(90deg, hsl(var(--program)) 0 10%, hsl(var(--cue)) 10% 20%, hsl(var(--preview)) 20% 30%, hsl(var(--trainer)) 30% 40%, #000 40% 50%)",
      }}
    />
  </div>
);

const Overlays = ({ pgm }: { pgm: boolean }) => {
  const { graphics } = useLiveDeck();
  if (!pgm) return null;
  return (
    <>
      {graphics.show.lowerThird && (
        <div className="absolute bottom-6 left-4 right-1/3 bg-program/90 text-program-foreground px-4 py-2 rounded-sm font-semibold text-sm shadow-lg">
          {graphics.lowerThird}
        </div>
      )}
      {graphics.logo && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 text-[10px] font-bold text-program tracking-widest">
          ◉ LIVE
        </div>
      )}
      {graphics.show.ticker && (
        <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-xs py-1 overflow-hidden whitespace-nowrap">
          <span className="inline-block animate-[ticker_20s_linear_infinite] pl-full">{graphics.ticker}</span>
        </div>
      )}
      {graphics.show.slate && (
        <div className="absolute inset-0 bg-program/95 flex items-center justify-center text-program-foreground text-3xl font-bold tracking-widest">
          {graphics.slate}
        </div>
      )}
    </>
  );
};

const CamFrame = ({ camId, muted, layerRef }: {
  camId: string; muted: boolean; layerRef?: React.Ref<HTMLDivElement>;
}) => {
  const cam = useLiveDeck((s) => s.cameras.find((c) => c.id === camId));
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    ref.current?.play().catch(() => {});
  }, [cam?.src, cam?.id]);
  return (
    <div ref={layerRef} className="absolute inset-0 will-change-transform">
      {cam?.alive && cam.src ? (
        <video
          ref={ref}
          src={cam.src}
          muted={muted}
          loop
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-mono bg-black">
          {cam?.alive ? "NO MEDIA — Import in Library" : "FEED LOST"}
        </div>
      )}
    </div>
  );
};

const Monitor = ({ bus }: { bus: Bus }) => {
  const { cameras, pgm, pvw } = useLiveDeck();
  const isPgm = bus === "pgm";
  const camId = isPgm ? pgm : pvw;
  const cam = cameras.find((c) => c.id === camId);

  const layerA = useRef<HTMLDivElement>(null);
  const layerB = useRef<HTMLDivElement>(null);
  const stingRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<string>(camId);
  const isPgmRef = useRef(isPgm);
  isPgmRef.current = isPgm;

  // Watch for pgm change; if it changed and this is PGM monitor, animate.
  useEffect(() => {
    if (!isPgmRef.current) {
      currentRef.current = camId;
      return;
    }
    const from = currentRef.current;
    const to = camId;
    if (from === to) return;

    const store = useLiveDeck.getState();
    const spec: TransitionSpec = {
      family: store.transition.type,
      variant: (store.transition.variant || undefined) as any,
      durationMs: store.transition.durationMs,
    };

    // layer A = old (was showing `from`), layer B = new (`to`)
    // We already rerendered with new camId → both layers currently show `to`.
    // Trick: set layer A background back to old by keeping a data-cam attr and
    // forcing DOM order. Simpler: momentarily hide new (B), keep A frozen showing
    // last frame via a snapshot canvas isn't feasible here — instead we bring
    // in B from hidden state so the transition animates B revealing.
    if (layerA.current && layerB.current) {
      runTransition(layerA.current, layerB.current, stingRef.current, spec).finally(() => {
        currentRef.current = to;
      });
    } else {
      currentRef.current = to;
    }
  }, [camId]);

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-hw font-bold uppercase tracking-widest border",
          isPgm
            ? "bg-program/10 text-program border-program/30"
            : "bg-preview/10 text-preview border-preview/30"
        )}
      >
        <span className={cn("w-2 h-2 rounded-full", isPgm ? "bg-program live-dot" : "bg-preview")} />
        {isPgm ? "Program" : "Preview"}
        <span className="ml-auto font-mono text-[11px] text-foreground">{cam?.label ?? "—"}</span>
        <span className="text-[8px] text-muted-foreground">1080p · 59.94</span>
      </div>
      <div className="relative">
        {/* faux monitor bezel */}
        <div className={cn(
          "relative aspect-video rounded-md overflow-hidden brushed-metal p-1.5",
          isPgm
            ? "shadow-[0_0_36px_hsl(var(--program)/0.35),inset_0_0_0_1px_hsl(var(--program)/0.4)]"
            : "shadow-[0_0_28px_hsl(var(--preview)/0.25),inset_0_0_0_1px_hsl(var(--preview)/0.4)]"
        )}>
          <span className="neo-screw absolute top-1 left-1" />
          <span className="neo-screw absolute top-1 right-1" />
          <span className="neo-screw absolute bottom-1 left-1" />
          <span className="neo-screw absolute bottom-1 right-1" />
          <div className={cn("relative w-full h-full rounded-sm overflow-hidden border",
            isPgm ? "border-program" : "border-preview")}>
            <CamFrame camId={camId} muted={!isPgm} layerRef={layerA} />
            {isPgm && <CamFrame camId={camId} muted layerRef={layerB} />}
            {isPgm && <StingLayer />}
            {isPgm && (
              <div ref={stingRef} className="absolute inset-0 pointer-events-none opacity-0 mix-blend-normal">
                <div className="w-full h-full" style={{
                  background: "radial-gradient(circle at 50% 50%, hsl(var(--cue)) 0%, hsl(var(--program)) 40%, #000 90%)",
                }} />
              </div>
            )}
            <Overlays pgm={isPgm} />
            {/* scanline sheen */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent 0 2px, black 2px 3px)" }} />
          </div>
        </div>
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
