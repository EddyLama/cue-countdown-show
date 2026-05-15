import { create } from "zustand";
import { DEFAULT_BINDINGS } from "@/lib/shortcuts";

const STORAGE_KEY = "livedeck.shortcuts.v1";

const load = (): Record<string, string> => {
  if (typeof localStorage === "undefined") return { ...DEFAULT_BINDINGS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BINDINGS };
    return { ...DEFAULT_BINDINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_BINDINGS };
  }
};

const persist = (b: Record<string, string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
  } catch {
    /* ignore */
  }
};

interface ShortcutsState {
  bindings: Record<string, string>;
  cheatSheetOpen: boolean;
  setBinding: (id: string, key: string) => void;
  resetBinding: (id: string) => void;
  resetAll: () => void;
  findConflict: (key: string, exceptId?: string) => string | null;
  openCheatSheet: () => void;
  closeCheatSheet: () => void;
  toggleCheatSheet: () => void;
}

export const useShortcuts = create<ShortcutsState>((set, get) => ({
  bindings: load(),
  cheatSheetOpen: false,

  setBinding: (id, key) =>
    set((s) => {
      // Clear any other action holding the same key (swap to empty).
      const next: Record<string, string> = { ...s.bindings };
      for (const [otherId, k] of Object.entries(next)) {
        if (otherId !== id && k === key) next[otherId] = "";
      }
      next[id] = key;
      persist(next);
      return { bindings: next };
    }),

  resetBinding: (id) =>
    set((s) => {
      const next = { ...s.bindings, [id]: DEFAULT_BINDINGS[id] };
      persist(next);
      return { bindings: next };
    }),

  resetAll: () => {
    const next = { ...DEFAULT_BINDINGS };
    persist(next);
    set({ bindings: next });
  },

  findConflict: (key, exceptId) => {
    if (!key) return null;
    const b = get().bindings;
    for (const [id, k] of Object.entries(b)) {
      if (k === key && id !== exceptId) return id;
    }
    return null;
  },

  openCheatSheet: () => set({ cheatSheetOpen: true }),
  closeCheatSheet: () => set({ cheatSheetOpen: false }),
  toggleCheatSheet: () => set((s) => ({ cheatSheetOpen: !s.cheatSheetOpen })),
}));
