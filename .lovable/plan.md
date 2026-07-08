## Goal

Elevate LiveDeck to feel like a real broadcast console (ATEM / Tricaster) with a proper audio DSP path, real animated transition effects, and a rich neumorphic UI inspired by Cubase / FL Studio (deep shadows, sculpted knobs, glossy meters, engraved panels) — without losing existing features.

## 1. Neumorphic design system (`src/index.css`, `tailwind.config.ts`)

- New tokens on the existing dark palette:
  - `--surface`, `--surface-raised`, `--surface-inset` (subtly different luminance)
  - `--shadow-neo-out`, `--shadow-neo-in`, `--shadow-neo-out-sm`, `--shadow-neo-in-sm` (dual light/dark box-shadows)
  - `--bevel-highlight`, `--bevel-shadow` (1px inner borders)
  - `--metal-gradient` (brushed panel), `--led-red/green/amber` glows
- Utility classes: `.neo-panel`, `.neo-inset`, `.neo-raised`, `.neo-button`, `.neo-knob`, `.neo-led`, `.neo-screw` (small corner rivets for hardware feel), `.brushed-metal`.
- Fonts: keep Inter + JetBrains Mono, add `Michroma` (or `Rajdhani`) for hardware labels.
- All new colors declared as HSL tokens; components use `bg-surface`, `shadow-neo-out`, etc.

## 2. Real audio engine (`src/lib/audioEngine.ts`, new)

Web Audio API graph, one per channel:

```text
MediaElementSource(video/file) → GainNode(fader)
                               → StereoPannerNode(pan)
                               → BiquadFilterNode x3 (EQ low/mid/high)
                               → DynamicsCompressorNode (comp)
                               → AnalyserNode (real VU / peak)
                               → busGain → masterGain → AnalyserNode → destination
```

- Singleton `AudioEngine` class: `attachSource(channelId, mediaEl)`, `setGain`, `setPan`, `setEQ`, `setComp`, `setSend(busId)`, `mute/solo`, `getLevels(channelId)` returning `{ rms, peak }`.
- Replace the fake `tickVU` with `requestAnimationFrame` reading from `AnalyserNode.getFloatTimeDomainData` → RMS + peak-hold.
- `liveDeckStore` audio state extended: `pan, eq{low,mid,high}, comp{threshold,ratio}, send{a,b}, peak, rmsL, rmsR`, buses A (PGM), B (AUX/monitor).
- Program video source auto-routed into engine when a clip is loaded.

## 3. Pro AudioMixer (`src/components/livedeck/AudioMixer.tsx` rewrite)

Neumorphic channel strip (Cubase-style vertical layout, ~90px wide each):

```text
┌────────┐
│  CH 1  │  engraved label
│  ▓▓▓▓  │  stereo peak meter (green→amber→red, peak-hold ticks)
│  ◉ ◉ ◉ │  3 EQ knobs (LOW/MID/HIGH)
│   ◉    │  PAN knob
│  ┌──┐  │  COMP threshold mini-knob + GR meter
│  │▓▓│  │  fader track (inset) + sculpted fader cap
│  │██│  │
│  └──┘  │
│ -6.2dB │  numeric readout
│ M S RC │  Mute / Solo / Record-arm LEDs
└────────┘
```

- Knobs are custom SVG components with drag-to-turn (vertical drag = value), double-click reset, mousewheel fine-adjust.
- Faders: full vertical drag, dB scale on the side (-∞, -60, -40, -20, -10, -5, 0, +6), 0dB detent.
- Meters: dual-channel L/R, gradient fill + peak-hold line, clip LED.
- Master strip on the right with additional stereo output meter, limiter LED, master fader.
- New `Bus tabs` above (MAIN / MON / AUX) to switch fader displays.

## 4. Real transition engine (`src/lib/transitionEngine.ts`, new + `ProgramPreview.tsx` rewrite)

Two stacked `<video>` layers in the PGM monitor (`layerA`, `layerB`); the visible one = current pgm, the hidden one = incoming pvw. Transitions animate compositing between them.

Transition types with real implementations:

- **CUT** — instant swap.
- **MIX** (dissolve) — CSS opacity crossfade, duration = `transition.durationMs`, eased.
- **FADE TO BLACK / WHITE** — via matte layer.
- **WIPE** — `clip-path` animation with direction picker (L→R, R→L, T→B, B→T, diagonal, iris/circle, box).
- **DVE** — CSS transform (scale + translate) push/slide, with `Push L/R/U/D` and `Squeeze` variants.
- **STING** — full-screen animated matte (SVG shape or PNG sequence) that briefly covers PGM while swap happens. Ship 3 built-in stingers (bars, circle-wipe, glitch) as inline SVG animations; leave a hook to import a user PNG sequence.

`transition.type` becomes `{ family, variant, duration }`. `TAKE` calls `transitionEngine.run(type)` which returns a Promise that resolves after the animation, then commits the pgm/pvw swap in the store.

## 5. Transition board (`src/components/livedeck/TransitionPanel.tsx`, new — replaces the transition row in `SwitcherPanel.tsx`)

Dedicated neumorphic panel to the right of the T-Bar area:

- Transition family buttons with LED indicators: CUT · MIX · WIPE · DVE · STING · FTB.
- Variant selector grid appears based on family (e.g. 8 wipe directions with mini-icons; 4 DVE push directions; sting picker with thumbnails).
- Rate encoder (knob) + digital readout (0.1–5.0s).
- Big amber `AUTO` button (runs selected transition) and big red `TAKE` (still available); `FTB` momentary button; `PREV TRANS` (preview transition on PVW monitor only).
- Motorized T-Bar visual: taller vertical slider with dB-style tick marks, LEDs at endpoints, animated ghost cap.
- Next-transition target strip: KEY1 / KEY2 / DSK / BKGD toggles (design-only stubs wired to graphics.show).

## 6. LiveDeck layout polish (`src/pages/LiveDeck.tsx`)

- Reorganize into a rack-style grid:
  - Top: `ProgramPreview` (larger, framed like a video monitor with faux screws)
  - Middle: `SwitcherPanel` (bus buttons only, tally LEDs) + `TransitionPanel` side by side
  - Bottom: `AudioMixer` (full-width channel strips) with tabs
- Every panel wrapped in `.neo-panel` with corner screws and a small brushed title bar.
- Keep sidebar (MultiViewWall + GraphicsPanel), restyle to neumorphic.
- Existing shortcuts, trainer panel, rundown, scoring remain untouched.

## 7. Header + peripheral polish

- `AppHeader` becomes a hardware-style title bar: brushed metal strip, LED clock, glowing ON-AIR sign.
- `GraphicsPanel`, `MultiViewWall`, `RundownStrip`: swap flat cards for neo-panels, keep behavior.

## Non-goals

- No backend, no new deps (Web Audio + CSS/SVG only).
- No changes to trainer scoring, shortcuts store, or rundown logic.
- No changes to Timer / Library / Analytics pages beyond token-level neumorphic restyle if trivial.

## Technical notes

- Web Audio: create `AudioContext` lazily on first user gesture (TAKE / play) to satisfy autoplay policy.
- Knob component: pointer events with `setPointerCapture`, `dy` mapped to value range, keyboard arrows for a11y.
- Peak-hold: track max over ~1.5s window then decay.
- Sting overlay lives in `ProgramPreview` above both video layers with `z-index` layering.
- All animations respect `prefers-reduced-motion` (fallback to CUT).
