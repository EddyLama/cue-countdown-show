export type ShortcutGroup = "Switcher" | "Rundown" | "Graphics" | "App";

export interface ShortcutDef {
  id: string;
  label: string;
  group: ShortcutGroup;
  defaultKey: string;
}

export const SHORTCUTS: ShortcutDef[] = [
  { id: "take", label: "TAKE (Program ↔ Preview)", group: "Switcher", defaultKey: "Space" },
  { id: "cut", label: "CUT", group: "Switcher", defaultKey: "Enter" },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `previewCam${i + 1}`,
    label: `Preview Camera ${i + 1}`,
    group: "Switcher" as ShortcutGroup,
    defaultKey: String(i + 1),
  })),
  { id: "advanceCue", label: "Advance Cue", group: "Rundown", defaultKey: "n" },
  { id: "toggleLowerThird", label: "Toggle Lower Third", group: "Graphics", defaultKey: "l" },
  { id: "toggleSlate", label: "Toggle Slate", group: "Graphics", defaultKey: "s" },
  { id: "toggleTicker", label: "Toggle Ticker", group: "Graphics", defaultKey: "t" },
  { id: "toggleTrainer", label: "Toggle Trainer Panel", group: "App", defaultKey: "g" },
  { id: "openCheatSheet", label: "Open Shortcut Cheat Sheet", group: "App", defaultKey: "?" },
];

export const DEFAULT_BINDINGS: Record<string, string> = Object.fromEntries(
  SHORTCUTS.map((s) => [s.id, s.defaultKey])
);

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

/** Serialize a KeyboardEvent into a stable binding string like "Shift+T" or "Space". */
export function serializeKey(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey && e.key.length !== 1) parts.push("Shift");
  if (e.metaKey) parts.push("Meta");

  let key = e.key;
  if (key === " ") key = "Space";
  // Normalize single chars to lowercase unless Shift produced a symbol like "?"
  if (key.length === 1) {
    if (!e.shiftKey || /[a-zA-Z]/.test(key)) key = key.toLowerCase();
  }
  parts.push(key);
  return parts.join("+");
}

/** Pretty display, e.g. "⇧ T" on mac. */
export function formatKey(binding: string): string {
  if (!binding) return "—";
  return binding
    .split("+")
    .map((p) => {
      if (isMac) {
        if (p === "Meta") return "⌘";
        if (p === "Alt") return "⌥";
        if (p === "Shift") return "⇧";
        if (p === "Ctrl") return "⌃";
      }
      if (p === "Space") return "Space";
      if (p.length === 1) return p.toUpperCase();
      return p;
    })
    .join(isMac ? " " : " + ");
}
