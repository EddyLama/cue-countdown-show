import { useLiveDeck } from "@/stores/liveDeckStore";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const GraphicsPanel = () => {
  const { graphics, setLowerThird, setSlate, setTicker, toggleGraphic } = useLiveDeck();
  return (
    <div className="bg-panel-elev border border-border rounded-lg p-3 space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Graphics / CG</div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Lower-third</Label>
          <Switch checked={graphics.show.lowerThird} onCheckedChange={() => toggleGraphic("lowerThird")} />
        </div>
        <Input
          value={graphics.lowerThird}
          onChange={(e) => setLowerThird(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Full-screen Slate</Label>
          <Switch checked={graphics.show.slate} onCheckedChange={() => toggleGraphic("slate")} />
        </div>
        <Input value={graphics.slate} onChange={(e) => setSlate(e.target.value)} className="h-8 text-xs" />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Ticker</Label>
          <Switch checked={graphics.show.ticker} onCheckedChange={() => toggleGraphic("ticker")} />
        </div>
        <Input value={graphics.ticker} onChange={(e) => setTicker(e.target.value)} className="h-8 text-xs" />
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border">
        <Label className="text-xs">Logo Bug</Label>
        <Switch checked={graphics.logo} onCheckedChange={() => toggleGraphic("logo")} />
      </div>
    </div>
  );
};
