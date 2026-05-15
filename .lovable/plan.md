
# LiveDeck Pro — Build Plan

Goal: elevate the current TV Production Timer into a full live-event production trainer (LiveDeck Pro) inspired by the uploaded HTML mockup, while keeping all existing countdown features (timer engine, captions, end caption, overtime, floating timer, presets, screens list).

Everything runs client-side in React + Tailwind. No backend required (Supabase already removed).

---

## 1. Information architecture

Add a top-level tabbed shell in `src/pages/Index.tsx`:

- **Timer** (existing UI — kept as-is, just relocated into a tab)
- **LiveDeck** (new: trainee production console)
- **Trainer** (new: dashboard / challenge injector / scoring)
- **Library** (new: media import + rundown editor + challenge packs)
- **Analytics** (new: scorecards, replay)

A persistent header shows: brand, LIVE indicator, Show Clock (reuses existing timer engine), Segment timer, On-Air source, Score, Trainer toggle.

```text
┌──────────────────────────────────────────────────────────────┐
│ LIVEDECK PRO  • LIVE • Show 00:12:34  Seg 02:10  ON-AIR CAM3 │
├──────────────┬──────────────────────────────────┬────────────┤
│ Multi-View   │ Program / Preview monitors       │ Rundown    │
│ (cam grid)   │ T-Bar + transitions + TAKE       │ (cues)     │
├──────────────┴──────────────────────────────────┴────────────┤
│ Audio mixer (faders + VU meters per channel + master)        │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. New modules

### 2.1 Media Library & Session Setup (`src/pages/Library.tsx`)
- Drag/drop or `<input type=file accept="video/*" multiple>` to import clips.
- Assign each clip to a virtual camera slot (Cam 1–12). Stored as object URLs in a Zustand store.
- Rundown editor: list of cues `{id, title, durationSec, notes}` with reorder + inline edit.
- Challenge pack picker (Corporate / Concert / Sports / Awards × Junior/Mid/Senior/Crisis).

### 2.2 Trainee Production Console (`src/pages/LiveDeck.tsx`)
- **Multi-View wall**: grid of `<video muted loop autoplay>` thumbnails, one per assigned cam. Tally border (red=PGM, green=PVW). Click → set Preview.
- **Program / Preview monitors**: two large `<video>` elements; switching swaps `src` / uses two stacked videos with crossfade for Mix transitions.
- **Bus rows**: PGM row + PVW row of camera buttons.
- **Transitions**: pills for Cut / Mix / Wipe / DVE / Sting + duration slider + T-Bar (`input[type=range]`) + big red **TAKE**. Keyboard shortcuts (1–9 = preview cam, Space = take, Enter = cut).
- **Audio mixer**: per-channel vertical faders, mute/solo, animated VU meter bars, master bus. State only (visual sim — no real WebAudio routing required initially; optional WebAudio gain on PGM video).
- **Graphics/CG panel**: toggle lower-third (uses existing `caption`), full-screen slate (uses existing `endCaption`), logo bug, ticker.
- **Countdown & clock panel**: reuses existing `useTimer` for segment/cue countdowns and reuses `FloatingTimer`.
- **Tally** computed from PGM/PVW state and reflected on multi-view + bus buttons.
- **Rundown strip**: scrolling list with active cue highlight + per-cue countdown.

### 2.3 Trainer Dashboard (`src/pages/Trainer.tsx` + slide-over panel)
- Slide-over right panel (toggled from header) available from any view.
- **Challenge Builder**: timeline editor — add events `{atSec, type, payload}`.
- **Challenge Injector**: one-click buttons (Cam dies, Wrong graphic, Audio dropout ch N, Cue early, Lose tally, Stinger fail).
- **Live Monitor**: mirrors trainee PGM output as a small canvas/video preview.
- **Scoring engine**: listens to events on the bus (transitions, takes, audio mute, cue advance) and grades reaction time, correctness, on-time cues. Score visible in header.
- **Session log**: chronological event feed (challenge / ok / error styling).

### 2.4 Challenge Library
- JSON packs in `src/data/challengePacks.ts`. Each pack has name, difficulty, ordered timed events.

### 2.5 Analytics & Replay (`src/pages/Analytics.tsx`)
- Per-session scorecard, mistake heatmap (grid of cues × error type).
- Session replay: scrub through recorded event timeline; PGM thumbnail reconstructed from event log.
- Export PDF using `jspdf` (lightweight, no backend).

---

## 3. State management

Add a single Zustand store `src/stores/liveDeckStore.ts`:

```ts
{
  cameras: { id, label, src }[],
  pgm: cameraId,
  pvw: cameraId,
  transition: { type, durationMs, progress },
  audio: { channels: {id,label,level,mute,solo,vu}[], master },
  graphics: { lowerThird, slate, logo, ticker, visible:{...} },
  rundown: { cues: Cue[], activeCueId, segmentStartedAt },
  trainer: { panelOpen, score, events: Event[], activePack },
  session: { startedAt, recording: Event[] }
}
```

The existing `useTimer` hook stays and powers the show clock + segment/cue countdowns. The existing `caption`/`endCaption` map onto `graphics.lowerThird` / `graphics.slate` so the Timer tab keeps working unchanged.

---

## 4. File changes

New:
- `src/stores/liveDeckStore.ts`
- `src/pages/LiveDeck.tsx`
- `src/pages/Trainer.tsx`
- `src/pages/Library.tsx`
- `src/pages/Analytics.tsx`
- `src/components/livedeck/Header.tsx`
- `src/components/livedeck/MultiViewWall.tsx`
- `src/components/livedeck/ProgramPreview.tsx`
- `src/components/livedeck/SwitcherBus.tsx`
- `src/components/livedeck/TransitionBar.tsx` (T-Bar + pills + TAKE)
- `src/components/livedeck/AudioMixer.tsx`
- `src/components/livedeck/GraphicsPanel.tsx`
- `src/components/livedeck/RundownStrip.tsx`
- `src/components/livedeck/TallyBadge.tsx`
- `src/components/trainer/TrainerPanel.tsx` (slide-over)
- `src/components/trainer/ChallengeInjector.tsx`
- `src/components/trainer/ChallengeBuilder.tsx`
- `src/components/trainer/SessionLog.tsx`
- `src/data/challengePacks.ts`
- `src/hooks/useScoring.ts`
- `src/hooks/useChallengeRunner.ts`
- `src/hooks/useSessionRecorder.ts`

Edits:
- `src/App.tsx` — add routes `/`, `/livedeck`, `/trainer`, `/library`, `/analytics` + shared layout with header + tabs.
- `src/pages/Index.tsx` — keep current Timer UI as the `/` route inside the new shell.
- `src/index.css` / `tailwind.config.ts` — add LiveDeck semantic tokens (program-red, preview-green, trainer-indigo, vu gradient stops) as HSL variables. No raw colors in components.

Dependencies to add: `zustand`, `jspdf`.

---

## 5. Visual design

Match the uploaded mockup's broadcast aesthetic but through the design system:
- Deep navy background, indigo accents for trainer, red for PGM, green for PVW, amber for cues/score.
- Mono font (`JetBrains Mono`) for timers and channel labels; Inter for UI.
- All values defined as HSL tokens in `index.css`; component classes use semantic tokens only.

---

## 6. What is preserved

- `useTimer` hook (unchanged) — drives show clock, segment, and cue countdowns.
- `TimerDisplay`, `TimerControls`, `FloatingTimer`, `ScreensList` — kept and reachable from the Timer tab; `FloatingTimer` becomes available globally from the header.
- Existing captions / end caption / overtime / presets continue to work and also feed the LiveDeck graphics panel.

---

## 7. Phased delivery (single PR but ordered for safety)

1. Shell + routing + header + design tokens (no behavior change to current Timer).
2. Zustand store + Library page (import clips, assign cams, edit rundown).
3. LiveDeck console (multi-view, PGM/PVW, T-Bar, transitions, TAKE, tally, keyboard shortcuts).
4. Audio mixer + Graphics panel + Rundown strip integration.
5. Trainer slide-over + challenge injector + scoring + session log.
6. Challenge packs + Analytics/replay + PDF export.

After each phase the app stays runnable and the original Timer features remain intact.
