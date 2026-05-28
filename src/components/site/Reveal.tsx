import { type ReactNode, type CSSProperties } from "react";
import { useReveal } from "@/lib/use-reveal";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "header" | "li";
  /** translate-y in px when hidden */
  y?: number;
};

export function Reveal({ children, className, id, delay = 0, as = "div", y = 24 }: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Tag = as as "div";
  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
    transform: visible ? "translate3d(0,0,0) scale(1)" : `translate3d(0,${y}px,0) scale(0.985)`,
    opacity: visible ? 1 : 0,
    filter: visible ? "blur(0)" : "blur(8px)",
  };
  return (
    <Tag
      id={id}
      ref={ref as never}
      style={style}
      className={cn("transition-all duration-700 ease-out will-change-transform", className)}
    >
      {children}
    </Tag>
  );
}
