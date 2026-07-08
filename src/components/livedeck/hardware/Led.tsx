import { cn } from "@/lib/utils";

interface LedProps {
  on?: boolean;
  color?: "red" | "green" | "amber" | "blue";
  size?: number;
  className?: string;
  pulse?: boolean;
}

const map = {
  red: "var(--led-red)",
  green: "var(--led-green)",
  amber: "var(--led-amber)",
  blue: "var(--led-blue)",
};

export const Led = ({ on = false, color = "green", size = 8, className, pulse }: LedProps) => (
  <span
    className={cn("neo-led", pulse && on && "live-dot", className)}
    data-on={on}
    style={{
      width: size,
      height: size,
      ["--led-color" as any]: map[color],
    }}
  />
);
