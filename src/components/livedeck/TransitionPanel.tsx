import { useLiveDeck, type TransitionType } from "@/stores/liveDeckStore";
import {
  TRANSITION_LABELS, WIPE_VARIANTS, DVE_VARIANTS, STING_VARIANTS,
} from "@/lib/transitionEngine";
import { Knob } from "./hardware/Knob";
import { Led } from "./hardware/Led";
import { PanelFrame } from "./hardware/PanelFrame";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  Circle, Square, MoveDiagonal, MoveDiagonal2,
  Maximize2, Minimize2, Zap, Repeat, Radio, Film,
} from "lucide-react";
import { useState } from "react";

const FAMILIES: TransitionType[] = ["cut", "mix", "wipe", "dve", "sting", "ftb"];

const WIPE_ICONS: Record<string, React.ComponentType<any>> = {
  left: ArrowLeft, right: ArrowRight, up: ArrowUp, down: ArrowDown,
  "diag-tl": MoveDiagonal, "diag-tr": MoveDiagonal2, iris: Circle, box: Square,
};
const DVE_ICONS: Record<string, React.ComponentType<any>> = {
  "push-l": ArrowLeft, "push-r": ArrowRight, "push-u": ArrowUp, "push-d": ArrowDown,
  squeeze: Minimize2, zoom: Maximize2,
};

export const TransitionPanel = () => {
  const { transition, setTransitionType, setTransitionVariant, setTransitionDuration, take, setTbar } =
    useLiveDeck();
  const [key1, setKey1] = useState(false);
  const [key2, setKey2] = useState(false);
  const [dsk, setDsk] = useState(false);
  const [bkgd, setBkgd] = useState(true);
  const graphics = useLiveDeck((s) => s.graphics);
  const toggleGraphic = useLiveDeck((s) => s.toggleGraphic);

  const variants =
    transition.type === "wipe" ? WIPE_VARIANTS :
    transition.type === "dve" ? DVE_VARIANTS :
    transition.type === "sting" ? STING_VARIANTS : [];
  const iconMap = transition.type === "wipe" ? WIPE_ICONS
                : transition.type === "dve" ? DVE_ICONS : {};

  return (
    <PanelFrame title="Transition Board" bodyClassName="p-3 space-y-3">
      {/* Family row */}
      <div className="flex gap-1.5">
        {FAMILIES.map((t) => (
          <button
            key={t}
            onClick={() => setTransitionType(t)}
            data-pressed={transition.type === t}
            className={cn(
              "neo-button flex-1 h-11 text-[11px] flex flex-col items-center justify-center gap-1",
              transition.type === t && "text-cue"
            )}
          >
            <Led on={transition.type === t} color={t === "ftb" ? "red" : "amber"} size={6} />
            {TRANSITION_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Variants */}
      {variants.length > 0 && (
        <div className="flex flex-wrap gap-1.5 neo-inset p-2">
          {variants.map((v) => {
            const Icon = iconMap[v] ?? Film;
            const active = (transition.variant || variants[0]) === v;
            return (
              <button
                key={v}
                onClick={() => setTransitionVariant(v)}
                data-pressed={active}
                className={cn(
                  "neo-button h-9 px-2 min-w-[44px] text-[9px] flex flex-col items-center justify-center gap-0.5",
                  active && "text-cue"
                )}
                title={v}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[8px] tracking-wider">{v}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Rate + AUTO + TAKE + FTB */}
      <div className="flex items-center gap-3">
        <Knob
          label="RATE"
          value={transition.durationMs}
          min={100}
          max={5000}
          size={44}
          color="cue"
          defaultValue={1000}
          format={(v) => `${(v / 1000).toFixed(2)}s`}
          onChange={(v) => setTransitionDuration(Math.round(v))}
        />

        {/* Vertical T-Bar */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] font-hw text-muted-foreground tracking-widest">T-BAR</span>
          <div className="relative neo-inset" style={{ width: 26, height: 90 }}>
            <input
              type="range"
              min={0} max={100} value={transition.tbar}
              onChange={(e) => setTbar(Number(e.target.value))}
              onMouseUp={(e) => {
                if (Number((e.target as HTMLInputElement).value) > 50) setTbar(100);
                else setTbar(0);
              }}
              className="fader-vertical absolute inset-0"
              style={{ accentColor: "hsl(var(--cue))" }}
            />
          </div>
          <div className="flex gap-1">
            <Led on={transition.tbar >= 99} color="green" size={6} />
            <Led on={transition.tbar <= 1} color="red" size={6} />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-2">
          <button
            onClick={take}
            className="neo-button h-14 text-sm text-cue-foreground bg-gradient-to-b from-cue to-cue/70"
            style={{ boxShadow: "inset 0 1px 0 hsl(0 0% 100%/0.4), inset 0 -1px 0 hsl(0 0% 0%/0.4), 0 4px 12px hsl(var(--cue)/0.5)" }}
          >
            <Zap className="w-4 h-4 inline mr-1" /> AUTO
          </button>
          <button
            onClick={take}
            className="neo-button h-14 text-sm text-program-foreground bg-gradient-to-b from-program to-program/70"
            style={{ boxShadow: "inset 0 1px 0 hsl(0 0% 100%/0.4), inset 0 -1px 0 hsl(0 0% 0%/0.4), 0 4px 14px hsl(var(--program)/0.6)" }}
          >
            <Radio className="w-4 h-4 inline mr-1" /> TAKE
          </button>
        </div>
      </div>

      {/* Next transition targets */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <span className="text-[8px] font-hw tracking-widest text-muted-foreground">NEXT TRANS</span>
        {[
          { k: "BKGD", v: bkgd, set: setBkgd },
          { k: "KEY1", v: key1, set: setKey1 },
          { k: "KEY2", v: key2, set: setKey2 },
          { k: "DSK",  v: dsk,  set: setDsk },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => t.set(!t.v)}
            data-pressed={t.v}
            className={cn("neo-button h-7 px-3 text-[9px] flex items-center gap-1.5", t.v && "text-cue")}
          >
            <Led on={t.v} color="amber" size={5} />
            {t.k}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => toggleGraphic("lowerThird")}
          data-pressed={graphics.show.lowerThird}
          className={cn("neo-button h-7 px-3 text-[9px] flex items-center gap-1.5",
            graphics.show.lowerThird && "text-cue")}
        >
          <Repeat className="w-3 h-3" /> L3
        </button>
      </div>
    </PanelFrame>
  );
};
