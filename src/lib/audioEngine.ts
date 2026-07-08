/**
 * Real audio engine using Web Audio API.
 * Per-channel graph: source -> gain -> pan -> EQ(low/mid/high) -> comp -> analyser -> master -> destination.
 * Sources attach lazily (created on demand from HTMLMediaElement).
 */

export interface ChannelSetting {
  gain: number; // 0-100 (fader %)
  pan: number; // -50..50
  low: number; // -12..12 dB
  mid: number; // -12..12 dB
  high: number; // -12..12 dB
  compThreshold: number; // -60..0 dB
  compRatio: number; // 1..20
  mute: boolean;
  solo: boolean;
}

export interface ChannelLevels {
  rms: number; // 0-100
  peak: number; // 0-100 (peak-hold)
}

interface ChannelNodes {
  source?: MediaElementAudioSourceNode | OscillatorNode | AudioBufferSourceNode;
  input: GainNode;
  gain: GainNode;
  pan: StereoPannerNode;
  low: BiquadFilterNode;
  mid: BiquadFilterNode;
  high: BiquadFilterNode;
  comp: DynamicsCompressorNode;
  analyser: AnalyserNode;
  buf: Float32Array;
  peakHold: number;
  peakDecayAt: number;
  attachedEl?: HTMLMediaElement;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private masterBuf: Float32Array = new Float32Array(1024);
  private channels = new Map<string, ChannelNodes>();
  private masterPeak = 0;
  private masterPeakAt = 0;
  private anySolo = false;

  ensureCtx(): AudioContext {
    if (!this.ctx) {
      const Ctx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctx();
      const m = this.ctx.createGain();
      m.gain.value = 0.85;
      const a = this.ctx.createAnalyser();
      a.fftSize = 1024;
      m.connect(a);
      a.connect(this.ctx.destination);
      this.master = m;
      this.masterAnalyser = a;
    }
    if (this.ctx!.state === "suspended") this.ctx!.resume().catch(() => {});
    return this.ctx!;
  }

  private makeChannel(id: string): ChannelNodes {
    const ctx = this.ensureCtx();
    const input = ctx.createGain();
    const gain = ctx.createGain();
    const pan = ctx.createStereoPanner();
    const low = ctx.createBiquadFilter();
    low.type = "lowshelf";
    low.frequency.value = 120;
    const mid = ctx.createBiquadFilter();
    mid.type = "peaking";
    mid.frequency.value = 1000;
    mid.Q.value = 0.9;
    const high = ctx.createBiquadFilter();
    high.type = "highshelf";
    high.frequency.value = 6000;
    const comp = ctx.createDynamicsCompressor();
    comp.knee.value = 6;
    comp.attack.value = 0.005;
    comp.release.value = 0.15;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;

    input.connect(gain);
    gain.connect(pan);
    pan.connect(low);
    low.connect(mid);
    mid.connect(high);
    high.connect(comp);
    comp.connect(analyser);
    analyser.connect(this.master!);

    const nodes: ChannelNodes = {
      input,
      gain,
      pan,
      low,
      mid,
      high,
      comp,
      analyser,
      buf: new Float32Array(analyser.fftSize),
      peakHold: 0,
      peakDecayAt: 0,
    };
    this.channels.set(id, nodes);
    return nodes;
  }

  getChannel(id: string): ChannelNodes {
    return this.channels.get(id) ?? this.makeChannel(id);
  }

  /** Attach an HTML media element as source. Idempotent per element. */
  attachElement(id: string, el: HTMLMediaElement) {
    const ch = this.getChannel(id);
    if (ch.attachedEl === el) return;
    try {
      const src = this.ctx!.createMediaElementSource(el);
      src.connect(ch.input);
      ch.source = src;
      ch.attachedEl = el;
    } catch {
      // Already attached elsewhere — silently ignore.
    }
  }

  /** Start a synthetic tone source for demo when no media is attached. */
  startTone(id: string, freq = 220) {
    const ch = this.getChannel(id);
    if (ch.source) return;
    const osc = this.ctx!.createOscillator();
    const noise = this.ctx!.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    noise.gain.value = 0.02;
    osc.connect(noise);
    noise.connect(ch.input);
    osc.start();
    ch.source = osc;
  }

  applySettings(id: string, s: ChannelSetting) {
    const ch = this.getChannel(id);
    const muted = s.mute || (this.anySolo && !s.solo);
    ch.gain.gain.value = muted ? 0 : (s.gain / 75) ** 2; // 75 = 0dB detent
    ch.pan.pan.value = s.pan / 50;
    ch.low.gain.value = s.low;
    ch.mid.gain.value = s.mid;
    ch.high.gain.value = s.high;
    ch.comp.threshold.value = s.compThreshold;
    ch.comp.ratio.value = s.compRatio;
  }

  setAnySolo(v: boolean) {
    this.anySolo = v;
  }

  setMaster(v: number) {
    if (!this.master) this.ensureCtx();
    this.master!.gain.value = (v / 75) ** 2;
  }

  /** Compute RMS & peak-hold for a channel. Returns 0-100. */
  readLevels(id: string): ChannelLevels {
    const ch = this.channels.get(id);
    if (!ch) return { rms: 0, peak: 0 };
    ch.analyser.getFloatTimeDomainData(ch.buf);
    let sum = 0;
    let peak = 0;
    for (let i = 0; i < ch.buf.length; i++) {
      const v = ch.buf[i];
      sum += v * v;
      const av = Math.abs(v);
      if (av > peak) peak = av;
    }
    const rms = Math.sqrt(sum / ch.buf.length);
    const rmsPct = Math.min(100, Math.max(0, (20 * Math.log10(rms + 1e-6) + 60) * 1.6));
    const peakPct = Math.min(100, Math.max(0, (20 * Math.log10(peak + 1e-6) + 60) * 1.6));
    const now = performance.now();
    if (peakPct > ch.peakHold) {
      ch.peakHold = peakPct;
      ch.peakDecayAt = now + 1200;
    } else if (now > ch.peakDecayAt) {
      ch.peakHold = Math.max(peakPct, ch.peakHold - 0.7);
    }
    return { rms: rmsPct, peak: ch.peakHold };
  }

  readMaster(): ChannelLevels {
    if (!this.masterAnalyser) return { rms: 0, peak: 0 };
    this.masterAnalyser.getFloatTimeDomainData(this.masterBuf);
    let sum = 0;
    let peak = 0;
    for (let i = 0; i < this.masterBuf.length; i++) {
      const v = this.masterBuf[i];
      sum += v * v;
      const av = Math.abs(v);
      if (av > peak) peak = av;
    }
    const rms = Math.sqrt(sum / this.masterBuf.length);
    const rmsPct = Math.min(100, Math.max(0, (20 * Math.log10(rms + 1e-6) + 60) * 1.6));
    const peakPct = Math.min(100, Math.max(0, (20 * Math.log10(peak + 1e-6) + 60) * 1.6));
    const now = performance.now();
    if (peakPct > this.masterPeak) {
      this.masterPeak = peakPct;
      this.masterPeakAt = now + 1200;
    } else if (now > this.masterPeakAt) {
      this.masterPeak = Math.max(peakPct, this.masterPeak - 0.7);
    }
    return { rms: rmsPct, peak: this.masterPeak };
  }
}

export const audioEngine = new AudioEngine();
