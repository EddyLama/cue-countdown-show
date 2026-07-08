import { useLiveDeck } from "@/stores/liveDeckStore";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PanelFrame } from "./hardware/PanelFrame";
import { Led } from "./hardware/Led";

export const GraphicsPanel = () => {
  const { graphics, setLowerThird, setSlate, setTicker, toggleGraphic } = useLiveDeck();
  const Row = ({ k, label, val, on }: { k: any; label: string; val: string; on: boolean }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-hw tracking-widest uppercase flex items-center gap-2">
          <Led on={on} color="amber" size={6} /> {label}
        </Label>
        <Switch checked={on} onCheckedChange={() => toggleGraphic(k)} />
      </div>
      <Input
        value={val}
        onChange={(e) => {
          if (k === "lowerThird") setLowerThird(e.target.value);
          else if (k === "slate") setSlate(e.target.value);
          else if (k === "ticker") setTicker(e.target.value);
        }}
        className="h-7 text-xs neo-inset border-0"
      />
    </div>
  );
  return (
    <PanelFrame title="Graphics / CG" bodyClassName="p-3 space-y-3">
      <Row k="lowerThird" label="Lower-third" val={graphics.lowerThird} on={graphics.show.lowerThird} />
      <Row k="slate" label="Full-screen Slate" val={graphics.slate} on={graphics.show.slate} />
      <Row k="ticker" label="Ticker" val={graphics.ticker} on={graphics.show.ticker} />
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <Label className="text-[10px] font-hw tracking-widest uppercase flex items-center gap-2">
          <Led on={graphics.logo} color="red" size={6} pulse /> Logo Bug (LIVE)
        </Label>
        <Switch checked={graphics.logo} onCheckedChange={() => toggleGraphic("logo")} />
      </div>
    </PanelFrame>
  );
};
