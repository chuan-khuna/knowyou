"use client";

import { QuizScreen } from "@/components/quiz-screen";
import { soloLevelingQuiz } from "@/games/solo-leveling";

/** A client component, because the quiz holds functions a server page can't pass down. */
export function SoloLevelingQuiz() {
  return (
    <QuizScreen
      quiz={soloLevelingQuiz}
      title="คุณรู้จัก Solo Leveling ดีแค่ไหน"
      intro={
        <>
          <p>ตอบคำถามเรื่องราวตั้งแต่ซองจินอูยังเป็นฮันเตอร์แรงก์ E ในดันเจี้ยนคู่ จนถึงศึกสุดท้ายของเว็บตูนตอนที่ 179 เลือกได้ว่าจะเล่นกี่ข้อ เริ่มจากข้อง่าย ๆ แล้วค่อย ๆ ยากขึ้น</p>
          <p>จบแล้วดูคะแนนและแรงก์ฮันเตอร์ของคุณ ไม่มีจับเวลา คิดได้เต็มที่</p>
        </>
      }
    />
  );
}
