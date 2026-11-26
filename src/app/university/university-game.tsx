"use client";

import { PlayScreen } from "@/components/play-screen";
import { university } from "@/games/university";
import { UniversityResult, parseUniversityReveal } from "./result";

export function UniversityGame() {
  return (
    <PlayScreen
      game="university"
      engine={university}
      title="ทายมหาวิทยาลัย"
      intro={
        <>
          <p>ตอบคำถามเรื่องชีวิตในมหาวิทยาลัย ทั้งรับน้อง การเดินทาง ที่กิน และงานประจำปี เกมจะถามไปเรื่อย ๆ จนกว่าจะมั่นใจ แล้วทายมหาวิทยาลัยของคุณเพียงครั้งเดียว</p>
          <p>ถ้าเรียนมาหลายที่ ให้ตอบตามมหาวิทยาลัยที่คุณเรียนปริญญาตรี และวิทยาเขตที่คุณเรียนนานที่สุด ข้อไหนไม่แน่ใจก็ตอบว่าไม่แน่ใจ อย่าเดา</p>
        </>
      }
      parseReveal={parseUniversityReveal}
      result={(play, controls) => <UniversityResult play={play} controls={controls} />}
    />
  );
}
