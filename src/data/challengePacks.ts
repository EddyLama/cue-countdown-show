export type Difficulty = "junior" | "mid" | "senior" | "crisis";

export interface ChallengeAction {
  kind:
    | "kill-camera"
    | "wrong-graphic"
    | "audio-dropout"
    | "force-mute"
    | "early-cue"
    | "lose-tally"
    | "stinger-fail";
  payload?: Record<string, unknown>;
  label: string;
  description: string;
}

export interface ChallengePack {
  id: string;
  name: string;
  scenario: string;
  difficulty: Difficulty;
  events: { atSec: number; action: ChallengeAction }[];
}

const ka = (label: string, payload?: Record<string, unknown>): ChallengeAction => ({
  kind: "kill-camera", label: `Kill ${label}`, description: `Camera ${label} feed dies`, payload,
});
const ad = (ch: string): ChallengeAction => ({
  kind: "audio-dropout", label: `Audio dropout ${ch}`, description: `Channel ${ch} loses signal`, payload: { ch },
});
const wg = (): ChallengeAction => ({
  kind: "wrong-graphic", label: "Wrong graphic on air", description: "Lower-third typo pushed live",
});
const ec = (): ChallengeAction => ({
  kind: "early-cue", label: "Early cue", description: "Director calls cue ahead of schedule",
});
const lt = (label: string): ChallengeAction => ({
  kind: "lose-tally", label: `Lose tally ${label}`, description: `Tally light fails on ${label}`, payload: { id: label },
});
const sf = (): ChallengeAction => ({
  kind: "stinger-fail", label: "Stinger fail", description: "Transition stinger glitches",
});
const fm = (ch: string): ChallengeAction => ({
  kind: "force-mute", label: `Force mute ${ch}`, description: `${ch} muted by external system`, payload: { ch },
});

export const CHALLENGE_PACKS: ChallengePack[] = [
  {
    id: "corp-junior",
    name: "Corporate Conference",
    scenario: "Multi-speaker keynote with slide cuts",
    difficulty: "junior",
    events: [
      { atSec: 30, action: ad("ch1") },
      { atSec: 90, action: wg() },
      { atSec: 150, action: ka("CAM 2") },
    ],
  },
  {
    id: "concert-mid",
    name: "Live Concert",
    scenario: "5-camera music broadcast",
    difficulty: "mid",
    events: [
      { atSec: 20, action: ad("ch3") },
      { atSec: 60, action: ka("CAM 4") },
      { atSec: 100, action: sf() },
      { atSec: 140, action: lt("CAM 1") },
    ],
  },
  {
    id: "sports-senior",
    name: "Sports Broadcast",
    scenario: "Fast-cut sports with replay decisions",
    difficulty: "senior",
    events: [
      { atSec: 15, action: ec() },
      { atSec: 45, action: ka("CAM 3") },
      { atSec: 70, action: fm("ch1") },
      { atSec: 100, action: wg() },
      { atSec: 140, action: ka("CAM 5") },
      { atSec: 180, action: sf() },
    ],
  },
  {
    id: "awards-crisis",
    name: "Awards Show — Crisis Mode",
    scenario: "Everything that can go wrong, will",
    difficulty: "crisis",
    events: [
      { atSec: 10, action: ka("CAM 2") },
      { atSec: 20, action: ad("ch2") },
      { atSec: 35, action: wg() },
      { atSec: 50, action: ka("CAM 4") },
      { atSec: 65, action: sf() },
      { atSec: 80, action: ec() },
      { atSec: 95, action: lt("CAM 1") },
      { atSec: 110, action: fm("ch1") },
      { atSec: 130, action: ka("CAM 6") },
    ],
  },
];

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  junior: "bg-preview/20 text-preview border-preview/40",
  mid: "bg-cue/20 text-cue border-cue/40",
  senior: "bg-trainer/20 text-trainer border-trainer/40",
  crisis: "bg-program/20 text-program border-program/40",
};
