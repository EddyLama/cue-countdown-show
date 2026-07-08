import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PanelFrameProps {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  screws?: boolean;
}

export const PanelFrame = ({
  title,
  right,
  children,
  className,
  bodyClassName,
  screws = true,
}: PanelFrameProps) => (
  <div className={cn("neo-panel flex flex-col", className)}>
    {title && (
      <div className="neo-panel-title">
        <span>{title}</span>
        {right && <div className="ml-auto flex items-center gap-2 normal-case tracking-normal">{right}</div>}
      </div>
    )}
    {screws && (
      <>
        <span className="neo-screw" style={{ top: 6, left: 6 }} />
        <span className="neo-screw" style={{ top: 6, right: 6 }} />
        <span className="neo-screw" style={{ bottom: 6, left: 6 }} />
        <span className="neo-screw" style={{ bottom: 6, right: 6 }} />
      </>
    )}
    <div className={cn("flex-1 min-h-0 p-3", bodyClassName)}>{children}</div>
  </div>
);
