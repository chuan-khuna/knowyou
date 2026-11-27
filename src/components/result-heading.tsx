"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { resultLanding } from "@/lib/anime-fx";

/**
 * A result's `h1`. When a play has just finished, it lands with a burst and
 * ตึ้ง!! (`resultLanding`); a result restored after a refresh shows none.
 */
export function ResultHeading({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => resultLanding(ref.current), []);
  return (
    <h1 ref={ref} className={className}>
      {children}
    </h1>
  );
}
