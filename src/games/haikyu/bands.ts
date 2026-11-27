import type { ScoreBand } from "@/games/quiz";

/** Volleyball club ranks, lowest first, covering 0 to 20 with no gap or overlap. */
export const SCORE_BANDS: readonly ScoreBand[] = [
  { min: 0, max: 4, title: "คนดูบนอัฒจันทร์", line: "ยังมองตามลูกไม่ทันเลย ลองดูการแข่งอีกสักแมตช์นะ" },
  { min: 5, max: 8, title: "ปีหนึ่งชมรมวอลเลย์", line: "ได้เข้าชมรมแล้ว แต่ยังต้องรับลูกตามเมนูซ้อมอีกเยอะ" },
  { min: 9, max: 12, title: "ตัวจริงคาราสุโนะ", line: "ลงสนามได้แล้ว พร้อมกระโดดตบบอลเร็วไปกับเซ็ตเตอร์" },
  { min: 13, max: 16, title: "เอซของทีม", line: "ฝีมือระดับนี้ ทั้งทีมพร้อมส่งลูกสุดท้ายให้คุณตบ" },
  { min: 17, max: 20, title: "ยักษ์ใหญ่ตัวจิ๋วคนใหม่", line: "คุณรู้จักไฮคิวทุกซอกทุกมุม ราวกับบินข้ามกำแพงตรงหน้าไปได้แล้ว" },
];
