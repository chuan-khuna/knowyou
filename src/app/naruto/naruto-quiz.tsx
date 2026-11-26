"use client";

import { QuizScreen } from "@/components/quiz-screen";
import { narutoQuiz } from "@/games/naruto";
import { QUESTIONS_PER_PLAY } from "@/games/quiz";

/** A client component, because the quiz holds functions a server page can't pass down. */
export function NarutoQuiz() {
  return (
    <QuizScreen
      quiz={narutoQuiz}
      title="คุณรู้จัก Naruto ดีแค่ไหน"
      intro={
        <>
          <p>
            ตอบคำถาม {QUESTIONS_PER_PLAY} ข้อ เรื่องราวตั้งแต่ภาคแรกจนจบสงครามนินจาครั้งที่สี่ เริ่มจากข้อง่าย ๆ แล้วค่อย ๆ ยากขึ้น
          </p>
          <p>ตอบแต่ละข้อแล้วจะรู้ทันทีว่าถูกหรือผิด จบแล้วดูคะแนนและฉายาแฟนของคุณ ไม่มีจับเวลา คิดได้เต็มที่</p>
        </>
      }
    />
  );
}
