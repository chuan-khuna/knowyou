"use client";

import { QuizScreen } from "@/components/quiz-screen";
import { haikyuQuiz } from "@/games/haikyu";

/** A client component, because the quiz holds functions a server page can't pass down. */
export function HaikyuQuiz() {
  return (
    <QuizScreen
      quiz={haikyuQuiz}
      title="คุณรู้จัก Haikyu!! ดีแค่ไหน"
      intro={
        <>
          <p>ตอบคำถามเรื่องราวตั้งแต่ฮินาตะ โชโยก้าวเข้าชมรมวอลเลย์บอลคาราสุโนะ จนถึงตอนจบของมังงะตอนที่ 402 เลือกได้ว่าจะเล่นกี่ข้อ เริ่มจากข้อง่าย ๆ แล้วค่อย ๆ ยากขึ้น</p>
          <p>จบแล้วดูคะแนนและระดับของคุณ ไม่มีจับเวลา คิดได้เต็มที่</p>
        </>
      }
    />
  );
}
