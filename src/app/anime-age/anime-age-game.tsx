"use client";

import { PlayScreen } from "@/components/play-screen";
import { animeAge } from "@/games/anime-age";
import { AnimeAgeResult, parseAnimeAgeReveal } from "./result";

export function AnimeAgeGame() {
  return (
    <PlayScreen
      game="anime-age"
      engine={animeAge}
      title="ทายอายุจากการ์ตูน"
      intro={
        <>
          <p>ตอบคำถามเกี่ยวกับการ์ตูนญี่ปุ่นที่คุณจำได้ เกมจะถามไปเรื่อย ๆ จนกว่าจะมั่นใจ แล้วทายอายุคุณเพียงครั้งเดียว</p>
          <p>ตอบตามจริงนะ เรื่องไหนไม่รู้จักหรือจำไม่ได้ ให้ตอบตามนั้น อย่าเดา</p>
        </>
      }
      parseReveal={parseAnimeAgeReveal}
      result={(play, controls) => <AnimeAgeResult play={play} controls={controls} />}
    />
  );
}
