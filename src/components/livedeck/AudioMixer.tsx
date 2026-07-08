import { useEffect, useRef } from "react";
import { useLiveDeck } from "@/stores/liveDeckStore";
import { audioEngine } from "@/lib/audioEngine";
import { Knob } from "./hardware/Knob";
import { Fader } from "./hardware/Fader";
import { Meter } from "./hardware/Meter";
import { Led } from "./hardware/Led";
import { PanelFrame } from "./hardware/PanelFrame";
import { cn } from "@/lib/utils";

const dbFromLevel = (level: number) => {
  // 75 = 0dB, exponential curve
  if (level <= 0) return -Infinity;
  const g = (level / 75) ** 2;
  return 20 * Math.log10(g);
};
const fmtDb = (level: number) => {
  const db = dbFromLevel(level);
  if (!isFinite(db)) return "-∞";
  return `${db >= 0 ? "+" : ""}${db.toFixed(1)}`;
};

const ChannelStrip = ({ id }: { id: string }) => {
  const ch = useLiveDeck((s) => s.audio.channels.find((c) => c.id === id)!);
  const {
    setChannelLevel, setChannelParam, toggleMute, toggleSolo, toggleArm,
  } = useLiveDeck();

  return (
    <div className="flex flex-col items-center gap-2 w-[76px] py-2 px-1 neo-raised">
      <div className="w-full text-center text-[9px] font-hw font-bold tracking-widest text-muted-foreground bg-black/40 rounded-sm py-0.5">
        {ch.label}
      </div>

      {/* EQ */}
      <div className="flex gap-1">
        <Knob label="HI" value={ch.high} min={-12} max={12} defaultValue={0} center color="preview"
              size={26} format={(v)=>`${v>=0?"+":""}${v.toFixed(0)}`}
              onChange={(v)=>setChannelParam(id,"high",v)} />
        <Knob label="MID" value={ch.mid} min={-12} max={12} defaultValue={0} center color="cue"
              size={26} format={(v)=>`${v>=0?"+":""}${v.toFixed(0)}`}
              onChange={(v)=>setChannelParam(id,"mid",v)} />
      </div>
      <div className="flex gap-1">
        <Knob label="LO" value={ch.low} min={-12} max={12} defaultValue={0} center color="program"
              size={26} format={(v)=>`${v>=0?"+":""}${v.toFixed(0)}`}
              onChange={(v)=>setChannelParam(id,"low",v)} />
        <Knob label="PAN" value={ch.pan} min={-50} max={50} defaultValue={0} center color="trainer"
              size={26} format={(v)=>v===0?"C":`${v>0?"R":"L"}${Math.abs(v).toFixed(0)}`}
              onChange={(v)=>setChannelParam(id,"pan",v)} />
      </div>

      {/* Comp */}
      <div className="w-full flex items-center justify-between px-1">
        <Knob label="THR" value={ch.compThreshold} min={-60} max={0} size={22} color="cue"
              defaultValue={-18} format={(v)=>`${v.toFixed(0)}`}
              onChange={(v)=>setChannelParam(id,"compThreshold",v)} />
        <Knob label="RAT" value={ch.compRatio} min={1} max={20} size={22} color="cue"
              defaultValue={3} format={(v)=>`${v.toFixed(1)}:1`}
              onChange={(v)=>setChannelParam(id,"compRatio",v)} />
      </div>

      {/* Fader + meter */}
      <div className="flex items-end gap-1.5 pt-1">
        <Meter value={ch.vu} peak={ch.peak} height={130} width={7} />
        <Fader value={ch.level} height={130} onChange={(v)=>setChannelLevel(id, v)} />
        <Meter value={ch.vu * 0.92} peak={ch.peak * 0.92} height={130} width={7} />
      </div>

      <div className="neo-screen px-1.5 py-0.5 text-[9px] font-bold tabular-nums w-full text-center">
        {fmtDb(ch.level)} dB
      </div>

      <div className="grid grid-cols-3 gap-1 w-full">
        <button
          onClick={()=>toggleMute(id)} data-pressed={ch.mute}
          className={cn("neo-button h-6 text-[9px] flex items-center justify-center gap-1",
            ch.mute && "text-program")}
          title="Mute"
        >
          <Led on={ch.mute} color="red" size={6} />M
        </button>
        <button
          onClick={()=>toggleSolo(id)} data-pressed={ch.solo}
          className={cn("neo-button h-6 text-[9px] flex items-center justify-center gap-1",
            ch.solo && "text-cue")}
          title="Solo"
        >
          <Led on={ch.solo} color="amber" size={6} />S
        </button>
        <button
          onClick={()=>toggleArm(id)} data-pressed={ch.armed}
          className={cn("neo-button h-6 text-[9px] flex items-center justify-center gap-1",
            ch.armed && "text-program")}
          title="Record arm"
        >
          <Led on={ch.armed} color="red" size={6} pulse />R
        </button>
      </div>
    </div>
  );
};

const MasterStrip = () => {
  const master = useLiveDeck((s) => s.audio.master);
  const setMaster = useLiveDeck((s) => s.setMaster);
  const masterAny = useLiveDeck((s) => s.audio as any);
  const rms = masterAny.masterVu ?? 0;
  const peak = masterAny.masterPeak ?? 0;

  return (
    <div className="flex flex-col items-center gap-2 w-[96px] py-2 px-1.5 neo-raised border-cue/20"
         style={{ boxShadow: "inset 0 1px 0 hsl(var(--bevel-hi)/0.6), 0 0 0 1px hsl(var(--cue)/0.15), 0 3px 6px hsl(0 0% 0% / 0.6)" }}>
      <div className="w-full text-center text-[9px] font-hw font-bold tracking-widest text-cue bg-black/50 rounded-sm py-0.5">
        MASTER
      </div>
      <div className="flex items-center gap-1 text-[8px] font-hw text-muted-foreground">
        <Led on={peak > 92} color="red" size={6} />
        <span>CLIP</span>
      </div>
      <div className="flex items-end gap-2 pt-1">
        <Meter value={rms} peak={peak} height={160} width={9} />
        <Fader value={master} height={160} onChange={setMaster} />
        <Meter value={rms * 0.94} peak={peak * 0.94} height={160} width={9} />
      </div>
      <div className="neo-screen px-1.5 py-0.5 text-[10px] font-bold tabular-nums w-full text-center">
        {fmtDb(master)} dB
      </div>
      <div className="text-[8px] font-hw text-muted-foreground tracking-widest">STEREO OUT</div>
    </div>
  );
};

export const AudioMixer = () => {
  const channels = useLiveDeck((s) => s.audio.channels);
  const setChannelLevels = useLiveDeck((s) => s.setChannelLevels);
  const setMasterLevels = useLiveDeck((s) => s.setMasterLevels);
  const setMaster = useLiveDeck.getState().setMaster;
  const master = useLiveDeck((s) => s.audio.master);
  const rafRef = useRef<number>();

  // apply engine settings when channels change, and read levels every frame
  useEffect(() => {
    // ensure ctx
    try { audioEngine.ensureCtx(); } catch {}
    // fire up demo tones so the mixer is alive even without media loaded
    const freqs = [180, 240, 320, 140, 480, 100];
    channels.forEach((c, i) => {
      audioEngine.startTone(c.id, freqs[i % freqs.length]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const anySolo = channels.some((c) => c.solo);
    audioEngine.setAnySolo(anySolo);
    channels.forEach((c) => {
      audioEngine.applySettings(c.id, {
        gain: c.level, pan: c.pan, low: c.low, mid: c.mid, high: c.high,
        compThreshold: c.compThreshold, compRatio: c.compRatio,
        mute: c.mute, solo: c.solo,
      });
    });
    audioEngine.setMaster(master);
  }, [channels, master]);

  useEffect(() => {
    const loop = () => {
      channels.forEach((c) => {
        const { rms, peak } = audioEngine.readLevels(c.id);
        setChannelLevels(c.id, rms, peak);
      });
      const m = audioEngine.readMaster();
      setMasterLevels(m.rms, m.peak);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [channels, setChannelLevels, setMasterLevels]);

  return (
    <PanelFrame
      title="Audio Console — DSP"
      right={
        <span className="text-[9px] font-mono text-muted-foreground">
          {channels.length}CH · 3-BAND EQ · COMP · MASTER
        </span>
      }
      bodyClassName="p-2"
    >
      <div className="flex gap-1.5 items-stretch overflow-x-auto">
        {channels.map((c) => <ChannelStrip key={c.id} id={c.id} />)}
        <div className="w-px bg-border/60 self-stretch mx-1" />
        <MasterStrip />
      </div>
    </PanelFrame>
  );
};
