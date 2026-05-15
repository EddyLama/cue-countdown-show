import { useEffect } from "react";
import { useLiveDeck } from "@/stores/liveDeckStore";
import { useShortcuts } from "@/stores/shortcutsStore";
import { serializeKey } from "@/lib/shortcuts";

const isTypingTarget = (t: EventTarget | null) => {
  if (!(t instanceof HTMLElement)) return false;
  if (t.isContentEditable) return true;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
};

export const useGlobalShortcuts = () => {
  const bindings = useShortcuts((s) => s.bindings);
  const toggleCheatSheet = useShortcuts((s) => s.toggleCheatSheet);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const key = serializeKey(e);
      // Find matching action
      let actionId: string | null = null;
      for (const [id, k] of Object.entries(bindings)) {
        if (k && k === key) {
          actionId = id;
          break;
        }
      }
      if (!actionId) return;

      const ld = useLiveDeck.getState();

      switch (actionId) {
        case "take":
          e.preventDefault();
          ld.take();
          break;
        case "cut":
          e.preventDefault();
          ld.cut();
          break;
        case "advanceCue":
          e.preventDefault();
          ld.advanceCue();
          break;
        case "toggleTrainer":
          e.preventDefault();
          ld.toggleTrainerPanel();
          break;
        case "toggleLowerThird":
          e.preventDefault();
          ld.toggleGraphic("lowerThird");
          break;
        case "toggleSlate":
          e.preventDefault();
          ld.toggleGraphic("slate");
          break;
        case "toggleTicker":
          e.preventDefault();
          ld.toggleGraphic("ticker");
          break;
        case "openCheatSheet":
          e.preventDefault();
          toggleCheatSheet();
          break;
        default:
          if (actionId.startsWith("previewCam")) {
            const n = Number(actionId.replace("previewCam", ""));
            const cam = ld.cameras[n - 1];
            if (cam?.alive) {
              e.preventDefault();
              ld.setPreview(cam.id);
            }
          }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [bindings, toggleCheatSheet]);
};
