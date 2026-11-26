import type { ScoreBand } from "@/games/quiz";

/** Basketball ranks, lowest first, covering 0 to 20 with no gap or overlap. */
export const SCORE_BANDS: readonly ScoreBand[] = [
  { min: 0, max: 4, title: "คนดูข้างสนาม", line: "ยังแยกไม่ออกเลยว่าใครคือคุโรโกะ ลองมองดี ๆ อีกครั้งนะ" },
  { min: 5, max: 8, title: "ตัวสำรองชมรมปีหนึ่ง", line: "ได้ใส่เสื้อทีมแล้ว แต่ต้องวิ่งรอบสนามตามเมนูของริโกะอีกเยอะ" },
  { min: 9, max: 12, title: "ตัวจริงเซย์ริน", line: "ลงสนามได้แล้ว พร้อมส่งบอลให้แสงสว่างของทีม" },
  { min: 13, max: 16, title: "ราชันไร้มงกุฎ", line: "ฝีมือระดับนี้ ใคร ๆ ก็ยอมรับ แม้จะยังไม่ได้มงกุฎ" },
  { min: 17, max: 20, title: "รุ่นปาฏิหาริย์", line: "คุณรู้จักเรื่องนี้ทุกซอกทุกมุม ราวกับเป็นผู้เล่นคนที่หกผู้เป็นเงาเอง" },
];
