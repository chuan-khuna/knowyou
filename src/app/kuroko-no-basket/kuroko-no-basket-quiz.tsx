"use client";

import { QuizScreen } from "@/components/quiz-screen";
import { kurokoNoBasketQuiz } from "@/games/kuroko-no-basket";

/** A client component, because the quiz holds functions a server page can't pass down. */
export function KurokoNoBasketQuiz() {
  return (
    <QuizScreen
      quiz={kurokoNoBasketQuiz}
      title="คุณรู้จัก Kuroko no Basket ดีแค่ไหน"
      intro={
        <>
          <p>ตอบคำถามเรื่องราวตั้งแต่คุโรโกะเข้าเซย์รินจนถึงศึกเอ็กซ์ตร้าเกม เลือกได้ว่าจะเล่นกี่ข้อ เริ่มจากข้อง่าย ๆ แล้วค่อย ๆ ยากขึ้น</p>
          <p>จบแล้วดูคะแนนและฉายาแฟนของคุณ ไม่มีจับเวลา คิดได้เต็มที่</p>
        </>
      }
    />
  );
}
