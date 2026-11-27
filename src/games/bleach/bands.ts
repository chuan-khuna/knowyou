import type { ScoreBand } from "@/games/quiz";

/** Soul Society ranks, lowest first, covering 0 to 20 with no gap or overlap. */
export const SCORE_BANDS: readonly ScoreBand[] = [
  { min: 0, max: 4, title: "ดวงวิญญาณล่องลอย", line: "ยังมองไม่เห็นยมทูตเลย ลองตั้งสมาธิแล้วมองดี ๆ อีกครั้งนะ" },
  { min: 5, max: 8, title: "นักเรียนสถาบันยมทูต", line: "ได้ดาบมาแล้ว แต่ยังไม่ได้ยินเสียงเรียกชื่อของมันเลย" },
  { min: 9, max: 12, title: "ยมทูตผู้ปลดชิไค", line: "ดาบของคุณตอบรับชื่อแล้ว พร้อมออกไปปราบฮอลโลว์ที่โลกมนุษย์" },
  { min: 13, max: 16, title: "รองหัวหน้าหน่วย", line: "ฝีมือระดับนี้ อีกก้าวเดียวก็ปลดบังไคได้แล้ว" },
  { min: 17, max: 20, title: "หัวหน้าหน่วยพิทักษ์", line: "คุณรู้จักบลีชทุกซอกทุกมุม ราวกับสวมฮาโอริของหัวหน้าหน่วยมาเอง" },
];
