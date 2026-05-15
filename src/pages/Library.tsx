import { useLiveDeck } from "@/stores/liveDeckStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { useRef, useState } from "react";

const Library = () => {
  const { cameras, setCameraSrc, rundown, addCue, updateCue, removeCue, reorderCue } = useLiveDeck();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [newCue, setNewCue] = useState({ title: "", durationSec: 60 });

  const onFile = (camId: string, f: File | null) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setCameraSrc(camId, url, f.name);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Media Library &amp; Session Setup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assign video clips to virtual camera slots and edit your show rundown.
        </p>
      </div>

      <Card className="p-5 bg-panel border-border">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Camera Slots</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {cameras.map((c) => (
            <div key={c.id} className="border border-border rounded-md p-3 bg-secondary/40">
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-sm font-bold">{c.label}</div>
                {c.src && (
                  <button
                    onClick={() => setCameraSrc(c.id, null)}
                    className="text-muted-foreground hover:text-program"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="aspect-video bg-black rounded overflow-hidden mb-2 border border-border">
                {c.src ? (
                  <video src={c.src} muted loop autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                    NO MEDIA
                  </div>
                )}
              </div>
              <input
                ref={(el) => (fileRefs.current[c.id] = el)}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => onFile(c.id, e.target.files?.[0] ?? null)}
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs gap-1.5"
                onClick={() => fileRefs.current[c.id]?.click()}
              >
                <Upload className="w-3 h-3" />
                {c.src ? "Replace" : "Import clip"}
              </Button>
              {c.fileName && (
                <div className="text-[10px] text-muted-foreground truncate mt-1.5">{c.fileName}</div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 bg-panel border-border">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Rundown</h2>
        <div className="space-y-2">
          {rundown.cues.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2 bg-secondary/40 border border-border rounded-md p-2">
              <span className="font-mono text-[10px] font-bold text-muted-foreground w-6">{i + 1}</span>
              <Input
                value={c.title}
                onChange={(e) => updateCue(c.id, { title: e.target.value })}
                className="h-8 flex-1 text-xs"
              />
              <Input
                type="number"
                min={1}
                value={c.durationSec}
                onChange={(e) => updateCue(c.id, { durationSec: Number(e.target.value) })}
                className="h-8 w-20 text-xs font-mono"
              />
              <span className="text-[10px] text-muted-foreground">sec</span>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => reorderCue(c.id, -1)}>
                <ArrowUp className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => reorderCue(c.id, 1)}>
                <ArrowDown className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-program" onClick={() => removeCue(c.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-end gap-2 mt-4 pt-4 border-t border-border">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">New cue</Label>
            <Input
              value={newCue.title}
              onChange={(e) => setNewCue({ ...newCue, title: e.target.value })}
              placeholder="Cue title"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Seconds</Label>
            <Input
              type="number"
              min={1}
              value={newCue.durationSec}
              onChange={(e) => setNewCue({ ...newCue, durationSec: Number(e.target.value) })}
              className="h-8 w-24 text-xs"
            />
          </div>
          <Button
            size="sm"
            className="h-8 gap-1.5"
            disabled={!newCue.title.trim()}
            onClick={() => {
              addCue({ title: newCue.title.trim(), durationSec: newCue.durationSec });
              setNewCue({ title: "", durationSec: 60 });
            }}
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Library;
