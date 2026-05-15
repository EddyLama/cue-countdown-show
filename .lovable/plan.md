# Keyboard Shortcuts Cheat Sheet + Customization

Centralize the LiveDeck keyboard shortcuts, expose them in a help dialog, and let users rebind keys (persisted in localStorage).

## What gets built

1. **Shortcut registry** — `src/lib/shortcuts.ts`
   - Defines all actions: `take`, `cut`, `previewCam1`…`previewCam9`, `advanceCue`, `toggleTrainer`, `toggleLowerThird`, `toggleSlate`, `toggleTicker`, `openCheatSheet` (`?`).
   - Each entry: `{ id, label, group, defaultKey }` (groups: Switcher, Rundown, Graphics, App).

2. **Bindings store** — `src/stores/shortcutsStore.ts` (zustand + localStorage)
   - State: `bindings: Record<actionId, string>` initialized from defaults, hydrated from `localStorage["livedeck.shortcuts.v1"]`.
   - Actions: `setBinding(id, key)`, `resetBinding(id)`, `resetAll()`. Conflict detection helper returns the action currently using a key.

3. **Global shortcut hook** — `src/hooks/useShortcuts.ts`
   - Single `keydown` listener on `window`, ignores typing in inputs/textareas/contenteditable.
   - Resolves key → actionId via current bindings, dispatches to handlers wired from `useLiveDeck`.
   - Mounted once in `src/App.tsx` so shortcuts work across tabs (today they only work on `/livedeck`).
   - Replaces the inline listener in `src/pages/LiveDeck.tsx`.

4. **Cheat Sheet dialog** — `src/components/livedeck/ShortcutsDialog.tsx`
   - shadcn `Dialog`. Opened via `?` key, header button (keyboard icon next to Trainer in `AppHeader.tsx`), or `openCheatSheet` action.
   - Grouped table: Action · Current key · Default · [Rebind] [Reset].
   - Rebind flow: click button → "Press any key…" capture mode → next keydown writes binding (Esc cancels). Warns on conflict and offers to swap.
   - Footer: "Reset all to defaults".

5. **Header entry point** — small `Keyboard` icon button in `AppHeader.tsx` opening the dialog (controlled via store flag `cheatSheetOpen` or local state lifted into `App.tsx`).

## Technical notes

- Key serialization: lowercase `e.key` plus modifier prefixes (`Ctrl+`, `Alt+`, `Shift+`, `Meta+`) — e.g. `Space`, `Enter`, `1`, `Shift+T`. Display uses `⌘ ⌥ ⇧ ⌃` on mac, words elsewhere.
- Number keys 1-9 keep mapping to `setPreview(cameras[n-1])`; stored as separate `previewCamN` actions so each is individually rebindable.
- Persistence is client-only (localStorage); no backend changes.
- No new dependencies.

## Files

- new: `src/lib/shortcuts.ts`, `src/stores/shortcutsStore.ts`, `src/hooks/useShortcuts.ts`, `src/components/livedeck/ShortcutsDialog.tsx`
- edit: `src/App.tsx` (mount hook + dialog), `src/components/livedeck/AppHeader.tsx` (button), `src/pages/LiveDeck.tsx` (remove inline listener; keep on-screen hint reading from registry)
