import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useShortcuts } from "@/stores/shortcutsStore";
import { SHORTCUTS, DEFAULT_BINDINGS, formatKey, serializeKey, type ShortcutGroup } from "@/lib/shortcuts";
import { cn } from "@/lib/utils";
import { RotateCcw, Keyboard } from "lucide-react";

const GROUPS: ShortcutGroup[] = ["Switcher", "Rundown", "Graphics", "App"];

export const ShortcutsDialog = () => {
  const { cheatSheetOpen, closeCheatSheet, bindings, setBinding, resetBinding, resetAll, findConflict } =
    useShortcuts();
  const [capturingId, setCapturingId] = useState<string | null>(null);

  useEffect(() => {
    if (!capturingId) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") {
        setCapturingId(null);
        return;
      }
      // Ignore lone modifier presses
      if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
      const key = serializeKey(e);
      setBinding(capturingId, key);
      setCapturingId(null);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [capturingId, setBinding]);

  return (
    <Dialog open={cheatSheetOpen} onOpenChange={(o) => !o && closeCheatSheet()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Click a key to rebind. Press Esc to cancel capture.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {GROUPS.map((group) => {
            const items = SHORTCUTS.filter((s) => s.group === group);
            if (!items.length) return null;
            return (
              <div key={group}>
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
                  {group}
                </h3>
                <div className="rounded-md border border-border divide-y divide-border">
                  {items.map((s) => {
                    const current = bindings[s.id] ?? "";
                    const isCapturing = capturingId === s.id;
                    const conflict = current ? findConflict(current, s.id) : null;
                    const isDefault = current === DEFAULT_BINDINGS[s.id];
                    return (
                      <div key={s.id} className="flex items-center gap-3 px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">{s.label}</div>
                          {conflict && (
                            <div className="text-[10px] text-destructive">
                              Conflicts with: {SHORTCUTS.find((x) => x.id === conflict)?.label}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setCapturingId(isCapturing ? null : s.id)}
                          className={cn(
                            "min-w-[110px] h-8 px-3 rounded-md font-mono text-xs border transition-colors",
                            isCapturing
                              ? "bg-trainer text-trainer-foreground border-trainer animate-pulse"
                              : current
                              ? "bg-secondary border-border hover:border-foreground/40"
                              : "bg-background border-dashed border-muted-foreground text-muted-foreground"
                          )}
                        >
                          {isCapturing ? "Press any key…" : current ? formatKey(current) : "Unassigned"}
                        </button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isDefault}
                          onClick={() => resetBinding(s.id)}
                          title="Reset to default"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAll}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset all to defaults
          </Button>
          <Button onClick={closeCheatSheet}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
