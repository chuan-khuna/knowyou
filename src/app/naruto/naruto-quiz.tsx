"use client";

import { QuizScreen } from "@/components/quiz-screen";
import { narutoQuiz } from "@/games/naruto";

/** A client component, because the quiz holds functions a server page can't pass down. */
export function NarutoQuiz() {
  return (
    <QuizScreen
      quiz={narutoQuiz}
      title="คุณรู้จัก Naruto ดีแค่ไหน"
      intro={
        <>
          <p>ตอบคำถามเรื่องราวตั้งแต่ภาคแรกจนจบสงครามนินจาครั้งที่สี่ เลือกได้ว่าจะเล่นกี่ข้อ เริ่มจากข้อง่าย ๆ แล้วค่อย ๆ ยากขึ้น</p>
          <p>จบแล้วดูคะแนนและฉายาแฟนของคุณ ไม่มีจับเวลา คิดได้เต็มที่</p>
        </>
      }
    />
  );
}
