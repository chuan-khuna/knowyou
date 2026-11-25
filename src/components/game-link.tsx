"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { sound } from "@/lib/sound";

/** A home card that opens a game, with the open sound. */
export function GameLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  return (
    <Link href={href} className={className} onClick={sound.openGame}>
      {children}
    </Link>
  );
}
