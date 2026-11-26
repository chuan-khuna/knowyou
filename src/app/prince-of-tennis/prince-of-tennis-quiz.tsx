"use client";

import { QuizScreen } from "@/components/quiz-screen";
import { princeOfTennisQuiz } from "@/games/prince-of-tennis";
import { QUESTIONS_PER_PLAY } from "@/games/quiz";

/** A client component, because the quiz holds functions a server page can't pass down. */
export function PrinceOfTennisQuiz() {
  return (
    <QuizScreen
      quiz={princeOfTennisQuiz}
      title="คุณรู้จัก Prince of Tennis ดีแค่ไหน"
      intro={
        <>
          <p>
            ตอบคำถาม {QUESTIONS_PER_PLAY} ข้อ เรื่องราวตั้งแต่ต้นเรื่องจนจบการแข่งขันระดับประเทศ เริ่มจากข้อง่าย ๆ แล้วค่อย ๆ
            ยากขึ้น
          </p>
          <p>ตอบแต่ละข้อแล้วจะรู้ทันทีว่าถูกหรือผิด จบแล้วดูคะแนนและฉายาแฟนของคุณ ไม่มีจับเวลา คิดได้เต็มที่</p>
        </>
      }
    />
  );
}
