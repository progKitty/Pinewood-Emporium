import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Segment = {
  text: string;
  className?: string;
  as?: "span" | "em";
};

type Props = {
  segments: Segment[];
  className?: string;
  cursorClassName?: string;
  label?: string;
  speed?: number;
  startDelay?: number;
};

export function HeroTypewriter({
  segments,
  className,
  cursorClassName,
  label,
  speed = 34,
  startDelay = 180,
}: Props) {
  const fullText = useMemo(() => segments.map((segment) => segment.text).join(""), [segments]);
  const [visibleChars, setVisibleChars] = useState(0);
  const complete = visibleChars >= fullText.length;

  useEffect(() => {
    setVisibleChars(0);

    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setVisibleChars(fullText.length);
      return;
    }

    let next = 0;
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        next += 1;
        setVisibleChars(next);
        if (next >= fullText.length && intervalId !== undefined) {
          window.clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [fullText, speed, startDelay]);

  const renderSegments = (chars?: number) => {
    let remaining = chars ?? fullText.length;

    return segments.map((segment, index) => {
      const Tag = segment.as ?? "span";
      const visibleText =
        chars === undefined
          ? segment.text
          : segment.text.slice(0, Math.max(0, Math.min(segment.text.length, remaining)));

      remaining -= segment.text.length;

      return (
        <Tag key={`${segment.text}-${index}`} className={segment.className}>
          {visibleText}
        </Tag>
      );
    });
  };

  return (
    <h1 className={cn("pw-hero-typewriter", className)} aria-label={label ?? fullText}>
      {complete ? (
        <>
          {renderSegments()}
          <span className={cn("pw-typing-cursor pw-typing-cursor-settled", cursorClassName)} aria-hidden="true" />
        </>
      ) : (
        <>
          <span className="invisible" aria-hidden="true">
            {renderSegments()}
          </span>
          <span className="pw-hero-typewriter-live" aria-hidden="true">
            {renderSegments(visibleChars)}
            <span className={cn("pw-typing-cursor", cursorClassName)} />
          </span>
        </>
      )}
    </h1>
  );
}
