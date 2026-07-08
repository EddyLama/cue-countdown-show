import { create } from "zustand";

export interface Camera {
  id: string;          // "cam1"..."cam12"
  label: string;       // "CAM 1"
  src: string | null;  // object URL
  fileName?: string;
  alive: boolean;      // false when "camera dies" challenge fires
}

export type TransitionType = "cut" | "mix" | "wipe" | "dve" | "sting" | "ftb";
export type TransitionVariant = string; // free-form variant id per family

export interface AudioChannel {
  id: string;
  label: string;
  level: number;     // 0-100 fader
  pan: number;       // -50..50
  low: number;       // -12..12 dB
  mid: number;
  high: number;
  compThreshold: number; // -60..0
  compRatio: number;     // 1..20
  mute: boolean;
  solo: boolean;
  armed: boolean;
  vu: number;        // 0-100 RMS
  peak: number;      // 0-100 peak-hold
}

export interface Cue {
  id: string;
  title: string;
  durationSec: number;
  notes?: string;
  done?: boolean;
}

export type SessionEventType =
  | "take" | "cut" | "preview-change" | "mute" | "solo" | "fader"
  | "cue-advance" | "graphic-toggle" | "challenge" | "score" | "info" | "error" | "ok";

export interface SessionEvent {
  id: string;
  t: number;             // ms since session start
  type: SessionEventType;
  message: string;
  payload?: Record<string, unknown>;
  level?: "info" | "ok" | "error" | "challenge";
}

export interface ScoreState {
  value: number;
  takes: number;
  errors: number;
  cuesHit: number;
  cuesMissed: number;
}

interface LiveDeckState {
  // Cameras
  cameras: Camera[];
  pgm: string;
  pvw: string;
  setCameraSrc: (id: string, src: string | null, fileName?: string) => void;
  killCamera: (id: string) => void;
  reviveCamera: (id: string) => void;
  setPreview: (id: string) => void;
  take: () => void;
  cut: () => void;

  // Transition
  transition: { type: TransitionType; variant: TransitionVariant; durationMs: number; tbar: number };
  setTransitionType: (t: TransitionType) => void;
  setTransitionVariant: (v: TransitionVariant) => void;
  setTransitionDuration: (ms: number) => void;
  setTbar: (v: number) => void;

  // Audio
  audio: { channels: AudioChannel[]; master: number };
  setChannelLevel: (id: string, level: number) => void;
  setChannelParam: (id: string, key: "pan" | "low" | "mid" | "high" | "compThreshold" | "compRatio", v: number) => void;
  toggleMute: (id: string) => void;
  toggleSolo: (id: string) => void;
  toggleArm: (id: string) => void;
  setMaster: (v: number) => void;
  setChannelLevels: (id: string, rms: number, peak: number) => void;
  setMasterLevels: (rms: number, peak: number) => void;
  tickVU: () => void;

  // Graphics
  graphics: {
    lowerThird: string;
    slate: string;
    logo: boolean;
    ticker: string;
    show: { lowerThird: boolean; slate: boolean; ticker: boolean };
  };
  setLowerThird: (s: string) => void;
  setSlate: (s: string) => void;
  setTicker: (s: string) => void;
  toggleGraphic: (k: "lowerThird" | "slate" | "ticker" | "logo") => void;

  // Rundown
  rundown: { cues: Cue[]; activeCueId: string | null; cueStartedAt: number | null };
  addCue: (c: Omit<Cue, "id">) => void;
  updateCue: (id: string, patch: Partial<Cue>) => void;
  removeCue: (id: string) => void;
  startCue: (id: string) => void;
  advanceCue: () => void;
  reorderCue: (id: string, dir: -1 | 1) => void;

  // Trainer / Session
  trainer: {
    panelOpen: boolean;
    score: ScoreState;
    events: SessionEvent[];
    activePackId: string | null;
  };
  toggleTrainerPanel: () => void;
  pushEvent: (e: Omit<SessionEvent, "id" | "t">) => void;
  adjustScore: (delta: number, reason?: string) => void;
  resetSession: () => void;

  session: { startedAt: number; recording: SessionEvent[] };
}

const defaultCameras = (): Camera[] =>
  Array.from({ length: 6 }, (_, i) => ({
    id: `cam${i + 1}`,
    label: `CAM ${i + 1}`,
    src: null,
    alive: true,
  }));

const makeChannel = (id: string, label: string, level: number, freq = 220): AudioChannel => ({
  id, label, level,
  pan: 0, low: 0, mid: 0, high: 0,
  compThreshold: -18, compRatio: 3,
  mute: false, solo: false, armed: false,
  vu: 0, peak: 0,
});
const defaultChannels = (): AudioChannel[] => [
  makeChannel("ch1", "MIC 1", 75),
  makeChannel("ch2", "MIC 2", 70),
  makeChannel("ch3", "GTR",   60),
  makeChannel("ch4", "BED",   55),
  makeChannel("ch5", "FX",    50),
  makeChannel("ch6", "PGM",   80),
];

const defaultRundown = (): Cue[] => [
  { id: crypto.randomUUID(), title: "Cold Open", durationSec: 30 },
  { id: crypto.randomUUID(), title: "Host Welcome", durationSec: 90 },
  { id: crypto.randomUUID(), title: "Guest Interview", durationSec: 240 },
  { id: crypto.randomUUID(), title: "VT Package", durationSec: 120 },
  { id: crypto.randomUUID(), title: "Outro", durationSec: 45 },
];

export const useLiveDeck = create<LiveDeckState>((set, get) => ({
  cameras: defaultCameras(),
  pgm: "cam1",
  pvw: "cam2",

  setCameraSrc: (id, src, fileName) =>
    set((s) => ({
      cameras: s.cameras.map((c) => (c.id === id ? { ...c, src, fileName, alive: true } : c)),
    })),

  killCamera: (id) =>
    set((s) => ({ cameras: s.cameras.map((c) => (c.id === id ? { ...c, alive: false } : c)) })),
  reviveCamera: (id) =>
    set((s) => ({ cameras: s.cameras.map((c) => (c.id === id ? { ...c, alive: true } : c)) })),

  setPreview: (id) => {
    if (get().pvw === id) return;
    set({ pvw: id });
    get().pushEvent({ type: "preview-change", message: `Preview → ${id.toUpperCase()}`, level: "info" });
  },

  take: () => {
    const { pgm, pvw, transition } = get();
    if (pgm === pvw) return;
    set({ pgm: pvw, pvw: pgm });
    get().pushEvent({
      type: "take",
      message: `TAKE ${transition.type.toUpperCase()} → ${pvw.toUpperCase()}`,
      level: "ok",
    });
    get().adjustScore(1, "clean take");
  },

  cut: () => {
    const { pgm, pvw } = get();
    if (pgm === pvw) return;
    set({ pgm: pvw, pvw: pgm, transition: { ...get().transition, type: "cut", tbar: 0 } });
    get().pushEvent({ type: "cut", message: `CUT → ${pvw.toUpperCase()}`, level: "ok" });
    get().adjustScore(1, "cut");
  },

  transition: { type: "mix", variant: "", durationMs: 1000, tbar: 0 },
  setTransitionType: (t) => set((s) => ({ transition: { ...s.transition, type: t, variant: "" } })),
  setTransitionVariant: (v) => set((s) => ({ transition: { ...s.transition, variant: v } })),
  setTransitionDuration: (ms) => set((s) => ({ transition: { ...s.transition, durationMs: ms } })),
  setTbar: (v) => {
    set((s) => ({ transition: { ...s.transition, tbar: v } }));
    if (v >= 100) {
      get().take();
      set((s) => ({ transition: { ...s.transition, tbar: 0 } }));
    }
  },

  audio: { channels: defaultChannels(), master: 85 },
  setChannelLevel: (id, level) =>
    set((s) => ({
      audio: { ...s.audio, channels: s.audio.channels.map((c) => (c.id === id ? { ...c, level } : c)) },
    })),
  setChannelParam: (id, key, v) =>
    set((s) => ({
      audio: { ...s.audio, channels: s.audio.channels.map((c) => (c.id === id ? { ...c, [key]: v } : c)) },
    })),
  toggleMute: (id) => {
    set((s) => ({
      audio: { ...s.audio, channels: s.audio.channels.map((c) => (c.id === id ? { ...c, mute: !c.mute } : c)) },
    }));
    get().pushEvent({ type: "mute", message: `Toggle MUTE ${id}`, level: "info" });
  },
  toggleSolo: (id) =>
    set((s) => ({
      audio: { ...s.audio, channels: s.audio.channels.map((c) => (c.id === id ? { ...c, solo: !c.solo } : c)) },
    })),
  toggleArm: (id) =>
    set((s) => ({
      audio: { ...s.audio, channels: s.audio.channels.map((c) => (c.id === id ? { ...c, armed: !c.armed } : c)) },
    })),
  setMaster: (v) => set((s) => ({ audio: { ...s.audio, master: v } })),
  setChannelLevels: (id, rms, peak) =>
    set((s) => ({
      audio: { ...s.audio, channels: s.audio.channels.map((c) => (c.id === id ? { ...c, vu: rms, peak } : c)) },
    })),
  setMasterLevels: (rms, peak) =>
    set((s) => ({ audio: { ...s.audio, masterVu: rms, masterPeak: peak } as any })),

  tickVU: () =>
    set((s) => ({
      audio: {
        ...s.audio,
        channels: s.audio.channels.map((c) => {
          const target = c.mute ? 0 : Math.min(100, c.level * (0.5 + Math.random() * 0.6));
          return { ...c, vu: c.vu * 0.6 + target * 0.4, peak: Math.max(c.peak * 0.9, c.vu) };
        }),
      },
    })),

  graphics: {
    lowerThird: "JANE DOE — Producer",
    slate: "TIME IS UP!",
    logo: true,
    ticker: "Welcome to LiveDeck Pro — train like you broadcast",
    show: { lowerThird: false, slate: false, ticker: false },
  },
  setLowerThird: (s) => set((st) => ({ graphics: { ...st.graphics, lowerThird: s } })),
  setSlate: (s) => set((st) => ({ graphics: { ...st.graphics, slate: s } })),
  setTicker: (s) => set((st) => ({ graphics: { ...st.graphics, ticker: s } })),
  toggleGraphic: (k) => {
    set((st) => ({
      graphics: {
        ...st.graphics,
        ...(k === "logo" ? { logo: !st.graphics.logo } : { show: { ...st.graphics.show, [k]: !st.graphics.show[k] } }),
      },
    }));
    get().pushEvent({ type: "graphic-toggle", message: `Toggle ${k}`, level: "info" });
  },

  rundown: { cues: defaultRundown(), activeCueId: null, cueStartedAt: null },
  addCue: (c) =>
    set((s) => ({ rundown: { ...s.rundown, cues: [...s.rundown.cues, { ...c, id: crypto.randomUUID() }] } })),
  updateCue: (id, patch) =>
    set((s) => ({ rundown: { ...s.rundown, cues: s.rundown.cues.map((c) => (c.id === id ? { ...c, ...patch } : c)) } })),
  removeCue: (id) =>
    set((s) => ({ rundown: { ...s.rundown, cues: s.rundown.cues.filter((c) => c.id !== id) } })),
  startCue: (id) => {
    set((s) => ({ rundown: { ...s.rundown, activeCueId: id, cueStartedAt: Date.now() } }));
    get().pushEvent({ type: "cue-advance", message: `Cue start: ${id}`, level: "info" });
  },
  advanceCue: () => {
    const { cues, activeCueId } = get().rundown;
    const idx = cues.findIndex((c) => c.id === activeCueId);
    const next = cues[idx + 1] ?? cues[0];
    if (!next) return;
    set((s) => ({
      rundown: {
        ...s.rundown,
        cues: s.rundown.cues.map((c) => (c.id === activeCueId ? { ...c, done: true } : c)),
        activeCueId: next.id,
        cueStartedAt: Date.now(),
      },
    }));
    get().pushEvent({ type: "cue-advance", message: `Advance → ${next.title}`, level: "ok" });
    get().adjustScore(2, "cue advance");
  },
  reorderCue: (id, dir) =>
    set((s) => {
      const cues = [...s.rundown.cues];
      const i = cues.findIndex((c) => c.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cues.length) return s;
      [cues[i], cues[j]] = [cues[j], cues[i]];
      return { rundown: { ...s.rundown, cues } };
    }),

  trainer: {
    panelOpen: false,
    score: { value: 100, takes: 0, errors: 0, cuesHit: 0, cuesMissed: 0 },
    events: [],
    activePackId: null,
  },
  toggleTrainerPanel: () => set((s) => ({ trainer: { ...s.trainer, panelOpen: !s.trainer.panelOpen } })),

  pushEvent: (e) => {
    const evt: SessionEvent = {
      id: crypto.randomUUID(),
      t: Date.now() - get().session.startedAt,
      ...e,
    };
    set((s) => ({
      trainer: { ...s.trainer, events: [evt, ...s.trainer.events].slice(0, 200) },
      session: { ...s.session, recording: [...s.session.recording, evt] },
    }));
  },

  adjustScore: (delta, reason) =>
    set((s) => {
      const next = { ...s.trainer.score };
      next.value = Math.max(0, Math.min(999, next.value + delta));
      if (delta < 0) next.errors += 1;
      if (delta > 0 && reason?.includes("take")) next.takes += 1;
      if (reason?.includes("cue")) next.cuesHit += 1;
      return { trainer: { ...s.trainer, score: next } };
    }),

  resetSession: () =>
    set({
      session: { startedAt: Date.now(), recording: [] },
      trainer: {
        panelOpen: get().trainer.panelOpen,
        score: { value: 100, takes: 0, errors: 0, cuesHit: 0, cuesMissed: 0 },
        events: [],
        activePackId: null,
      },
    }),

  session: { startedAt: Date.now(), recording: [] },
}));
