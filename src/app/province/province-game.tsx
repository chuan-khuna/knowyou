"use client";

import { PlayScreen } from "@/components/play-screen";
import { province } from "@/games/province";
import { LiveMap, NeighboursMap } from "./maps";
import { ProvinceResult, parseProvinceReveal } from "./result";

export function ProvinceGame() {
  return (
    <PlayScreen
      game="province"
      engine={province}
      title="ทายจังหวัด"
      intro={
        <>
          <p>ตอบคำถามเรื่องภาษา อาหาร และประเพณีแถวบ้านคุณ เกมจะถามไปเรื่อย ๆ จนกว่าจะมั่นใจ แล้วทายจังหวัดของคุณเพียงครั้งเดียว</p>
          <p>ถ้าย้ายบ้านมา ให้ตอบตามจังหวัดที่คุณโตมา ข้อไหนไม่แน่ใจก็ตอบว่าไม่แน่ใจ อย่าเดา</p>
        </>
      }
      parseReveal={parseProvinceReveal}
      live={(live) => <LiveMap belief={live.belief} />}
      figure={(figure) => (figure === "neighbours" ? <NeighboursMap /> : null)}
      result={(play, controls) => <ProvinceResult play={play} controls={controls} />}
    />
  );
}
