/**
 * Real transition compositor.
 * Given two <video> layers (A = current PGM, B = incoming), animate B into view
 * according to selected transition family+variant, then resolve.
 * The caller is expected to swap PGM/PVW after the promise resolves.
 */

export type TransitionFamily = "cut" | "mix" | "wipe" | "dve" | "sting" | "ftb";
export type WipeVariant =
  | "left" | "right" | "up" | "down"
  | "diag-tl" | "diag-tr" | "iris" | "box";
export type DveVariant = "push-l" | "push-r" | "push-u" | "push-d" | "squeeze" | "zoom";
export type StingVariant = "bars" | "circle" | "glitch";

export interface TransitionSpec {
  family: TransitionFamily;
  variant?: WipeVariant | DveVariant | StingVariant;
  durationMs: number;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const wipeClip = (v: WipeVariant, p: number): string => {
  // p 0..1 = incoming coverage
  const inv = 1 - p;
  switch (v) {
    case "left": return `inset(0 ${inv * 100}% 0 0)`;
    case "right": return `inset(0 0 0 ${inv * 100}%)`;
    case "up": return `inset(${inv * 100}% 0 0 0)`;
    case "down": return `inset(0 0 ${inv * 100}% 0)`;
    case "diag-tl": {
      const q = p * 200; // sweep diagonal
      return `polygon(0 0, ${q}% 0, 0 ${q}%)`;
    }
    case "diag-tr": {
      const q = p * 200;
      return `polygon(100% 0, ${100 - q}% 0, 100% ${q}%)`;
    }
    case "iris": {
      const r = p * 75;
      return `circle(${r}% at 50% 50%)`;
    }
    case "box": {
      const m = inv * 50;
      return `inset(${m}% ${m}% ${m}% ${m}%)`;
    }
  }
};

export async function runTransition(
  layerA: HTMLElement,
  layerB: HTMLElement,
  sting: HTMLElement | null,
  spec: TransitionSpec,
  onProgress?: (p: number) => void
): Promise<void> {
  const { family, durationMs } = spec;
  const dur = Math.max(50, durationMs);

  // reset both
  const reset = () => {
    layerA.style.opacity = "1";
    layerA.style.transform = "";
    layerA.style.clipPath = "";
    (layerA.style as any).webkitClipPath = "";
    layerB.style.opacity = "1";
    layerB.style.transform = "";
    layerB.style.clipPath = "";
    (layerB.style as any).webkitClipPath = "";
    if (sting) {
      sting.style.opacity = "0";
      sting.style.transform = "";
      sting.dataset.variant = "";
    }
  };
  reset();

  if (family === "cut") {
    onProgress?.(1);
    return;
  }

  return new Promise((resolve) => {
    // Prep: B starts hidden per family
    if (family === "mix") {
      layerB.style.opacity = "0";
    } else if (family === "wipe") {
      layerB.style.clipPath = wipeClip((spec.variant as WipeVariant) ?? "left", 0);
      (layerB.style as any).webkitClipPath = layerB.style.clipPath;
    } else if (family === "dve") {
      const v = (spec.variant as DveVariant) ?? "push-l";
      if (v === "push-l") { layerB.style.transform = "translateX(100%)"; }
      if (v === "push-r") { layerB.style.transform = "translateX(-100%)"; }
      if (v === "push-u") { layerB.style.transform = "translateY(100%)"; }
      if (v === "push-d") { layerB.style.transform = "translateY(-100%)"; }
      if (v === "squeeze") { layerB.style.transform = "scaleX(0)"; }
      if (v === "zoom") { layerB.style.transform = "scale(0.01)"; layerB.style.opacity = "0"; }
    } else if (family === "sting" && sting) {
      sting.dataset.variant = (spec.variant as string) ?? "circle";
      sting.style.opacity = "1";
    } else if (family === "ftb") {
      // fade to black then back
    }

    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const p = easeInOut(t);
      onProgress?.(t);

      switch (family) {
        case "mix":
          layerB.style.opacity = String(p);
          break;
        case "wipe": {
          const clip = wipeClip((spec.variant as WipeVariant) ?? "left", p);
          layerB.style.clipPath = clip;
          (layerB.style as any).webkitClipPath = clip;
          break;
        }
        case "dve": {
          const v = (spec.variant as DveVariant) ?? "push-l";
          if (v === "push-l") {
            layerB.style.transform = `translateX(${(1 - p) * 100}%)`;
            layerA.style.transform = `translateX(${-p * 100}%)`;
          } else if (v === "push-r") {
            layerB.style.transform = `translateX(${-(1 - p) * 100}%)`;
            layerA.style.transform = `translateX(${p * 100}%)`;
          } else if (v === "push-u") {
            layerB.style.transform = `translateY(${(1 - p) * 100}%)`;
            layerA.style.transform = `translateY(${-p * 100}%)`;
          } else if (v === "push-d") {
            layerB.style.transform = `translateY(${-(1 - p) * 100}%)`;
            layerA.style.transform = `translateY(${p * 100}%)`;
          } else if (v === "squeeze") {
            layerA.style.transform = `scaleX(${1 - p})`;
            layerB.style.transform = `scaleX(${p})`;
          } else if (v === "zoom") {
            layerB.style.opacity = String(p);
            layerB.style.transform = `scale(${p})`;
            layerA.style.transform = `scale(${1 + p * 0.4})`;
            layerA.style.opacity = String(1 - p);
          }
          break;
        }
        case "sting": {
          // A visible in first half, B in second; sting covers middle
          if (t < 0.5) {
            layerB.style.opacity = "0";
            if (sting) sting.style.opacity = String(t * 2);
          } else {
            layerB.style.opacity = "1";
            if (sting) sting.style.opacity = String((1 - t) * 2);
          }
          break;
        }
        case "ftb": {
          // fade A to black then reveal B
          if (t < 0.5) {
            layerA.style.opacity = String(1 - t * 2);
            layerB.style.opacity = "0";
          } else {
            layerA.style.opacity = "0";
            layerB.style.opacity = String((t - 0.5) * 2);
          }
          break;
        }
      }

      if (t >= 1) {
        reset();
        resolve();
      } else {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
  });
}

export const TRANSITION_LABELS: Record<TransitionFamily, string> = {
  cut: "Cut",
  mix: "Mix",
  wipe: "Wipe",
  dve: "DVE",
  sting: "Sting",
  ftb: "FTB",
};

export const WIPE_VARIANTS: WipeVariant[] = [
  "left", "right", "up", "down", "diag-tl", "diag-tr", "iris", "box",
];
export const DVE_VARIANTS: DveVariant[] = [
  "push-l", "push-r", "push-u", "push-d", "squeeze", "zoom",
];
export const STING_VARIANTS: StingVariant[] = ["bars", "circle", "glitch"];
