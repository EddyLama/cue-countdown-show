import { useLiveDeck } from "@/stores/liveDeckStore";
import { MultiViewWall } from "@/components/livedeck/MultiViewWall";
import { ProgramPreview } from "@/components/livedeck/ProgramPreview";
import { SwitcherPanel } from "@/components/livedeck/SwitcherPanel";
import { AudioMixer } from "@/components/livedeck/AudioMixer";
import { GraphicsPanel } from "@/components/livedeck/GraphicsPanel";
import { RundownStrip } from "@/components/livedeck/RundownStrip";
import { useShortcuts } from "@/stores/shortcutsStore";
import { formatKey } from "@/lib/shortcuts";

const LiveDeck = () => {
  const { cameras } = useLiveDeck();
  const bindings = useShortcuts((s) => s.bindings);
  const openCheatSheet = useShortcuts((s) => s.openCheatSheet);

  return (
    <div className="flex flex-1 min-h-0">
      <aside className="w-72 shrink-0 border-r border-border bg-panel p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Multi-View Wall
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">{cameras.length} SRC</span>
        </div>
        <MultiViewWall cols={2} compact />
        <GraphicsPanel />
      </aside>

      <main className="flex-1 flex flex-col p-4 gap-4 min-w-0 overflow-hidden">
        <ProgramPreview />
        <SwitcherPanel />
        <AudioMixer />
        <div className="text-[10px] text-muted-foreground text-center font-mono">
          Shortcuts: <kbd className="px-1 bg-secondary rounded">1-9</kbd> preview cam ·
          {" "}<kbd className="px-1 bg-secondary rounded">Space</kbd> TAKE ·
          {" "}<kbd className="px-1 bg-secondary rounded">Enter</kbd> CUT
        </div>
      </main>

      <RundownStrip />
    </div>
  );
};

export default LiveDeck;
