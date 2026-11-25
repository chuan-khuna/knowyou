export interface ScoreBand {
  /** Inclusive. */
  readonly min: number;
  /** Inclusive. */
  readonly max: number;
  readonly title: string;
  readonly line: string;
}

/** Lowest first, covering 0 to 20 with no gap or overlap. */
export const SCORE_BANDS: readonly ScoreBand[] = [
  { min: 0, max: 4, title: "ยังอ่อนหัดนัก", line: "ไปวิ่งรอบสนามอีกสักสิบรอบ แล้วค่อยกลับมาใหม่นะ" },
  { min: 5, max: 8, title: "เด็กเก็บลูกชมรมปีหนึ่ง", line: "ยังได้แต่เก็บลูกข้างสนาม แต่ตัวจริงทุกคนก็เริ่มจากตรงนี้" },
  { min: 9, max: 12, title: "ตัวจริงของชมรม", line: "ผ่านการคัดตัวมาได้ แต่น้ำผักของอินุอิยังรอคุณอยู่" },
  { min: 13, max: 16, title: "ตัวแทนระดับคันโต", line: "ฝีมือขนาดนี้ อย่าประมาท แล้วไปให้ถึงระดับประเทศ" },
  { min: 17, max: 20, title: "เจ้าชายแห่งเทนนิส", line: "คุณรู้จักเรื่องนี้ดีราวกับยืนอยู่ในสนามเอง" },
];

export function bandFor(score: number): ScoreBand {
  const band = SCORE_BANDS.find((b) => score >= b.min && score <= b.max);
  if (!band) throw new Error(`no band for score ${score}`);
  return band;
}
