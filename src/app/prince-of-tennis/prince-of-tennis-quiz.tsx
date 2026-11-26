"use client";

import { QuizScreen } from "@/components/quiz-screen";
import { princeOfTennisQuiz } from "@/games/prince-of-tennis";

/** A client component, because the quiz holds functions a server page can't pass down. */
export function PrinceOfTennisQuiz() {
  return (
    <QuizScreen
      quiz={princeOfTennisQuiz}
      title="คุณรู้จัก Prince of Tennis ดีแค่ไหน"
      intro={
        <>
          <p>ตอบคำถามเรื่องราวตั้งแต่ต้นเรื่องจนจบการแข่งขันระดับประเทศ เลือกได้ว่าจะเล่นกี่ข้อ เริ่มจากข้อง่าย ๆ แล้วค่อย ๆ ยากขึ้น</p>
          <p>จบแล้วดูคะแนนและฉายาแฟนของคุณ ไม่มีจับเวลา คิดได้เต็มที่</p>
        </>
      }
    />
  );
}
