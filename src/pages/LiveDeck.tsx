import { useLiveDeck } from "@/stores/liveDeckStore";
import { MultiViewWall } from "@/components/livedeck/MultiViewWall";
import { ProgramPreview } from "@/components/livedeck/ProgramPreview";
import { SwitcherPanel } from "@/components/livedeck/SwitcherPanel";
import { TransitionPanel } from "@/components/livedeck/TransitionPanel";
import { AudioMixer } from "@/components/livedeck/AudioMixer";
import { GraphicsPanel } from "@/components/livedeck/GraphicsPanel";
import { RundownStrip } from "@/components/livedeck/RundownStrip";
import { PanelFrame } from "@/components/livedeck/hardware/PanelFrame";
import { useShortcuts } from "@/stores/shortcutsStore";
import { formatKey } from "@/lib/shortcuts";

const LiveDeck = () => {
  const { cameras } = useLiveDeck();
  const bindings = useShortcuts((s) => s.bindings);
  const openCheatSheet = useShortcuts((s) => s.openCheatSheet);

  return (
    <div className="flex flex-1 min-h-0">
      <aside className="w-72 shrink-0 bg-panel/60 p-3 flex flex-col gap-3 overflow-y-auto border-r border-border">
        <PanelFrame
          title="Multi-View Wall"
          right={<span className="text-[9px] font-mono text-muted-foreground">{cameras.length} SRC</span>}
          bodyClassName="p-2"
        >
          <MultiViewWall cols={2} compact />
        </PanelFrame>
        <GraphicsPanel />
      </aside>

      <main className="flex-1 flex flex-col p-3 gap-3 min-w-0 overflow-hidden">
        <ProgramPreview />
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3">
            <SwitcherPanel />
          </div>
          <div className="col-span-2">
            <TransitionPanel />
          </div>
        </div>
        <AudioMixer />
        <div className="text-[10px] text-muted-foreground text-center font-mono">
          <kbd className="px-1 bg-secondary rounded">{formatKey(bindings.take)}</kbd> TAKE ·{" "}
          <kbd className="px-1 bg-secondary rounded">{formatKey(bindings.cut)}</kbd> CUT ·{" "}
          <kbd className="px-1 bg-secondary rounded">1-9</kbd> preview cam ·{" "}
          <button onClick={openCheatSheet} className="underline hover:text-foreground">
            View all shortcuts ({formatKey(bindings.openCheatSheet)})
          </button>
        </div>
      </main>

      <RundownStrip />
    </div>
  );
};

export default LiveDeck;
