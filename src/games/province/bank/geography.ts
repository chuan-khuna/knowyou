import { geo } from "../schema";

/** At most five, at the user's request: the game should not feel like a map quiz. */
export const geography = {
  sea: geo({
    measure: "sea-hours",
    prompt: "จากบ้านไปถึงทะเลที่ใกล้ที่สุด ใช้เวลาประมาณเท่าไหร่?",
    labels: { "sea-30m": "ไม่ถึง 30 นาที", "sea-2h": "30 นาที ถึง 2 ชั่วโมง", "sea-5h": "2 ถึง 5 ชั่วโมง", "sea-far": "เกิน 5 ชั่วโมง" },
  }),

  mountains: geo({
    measure: "terrain",
    prompt: "มองออกไปจากแถวบ้าน เห็นภูเขาไหม?",
    labels: { mountains: "ดอยหรือภูเขาล้อมรอบ เห็นทุกวัน", hills: "เห็นเขาอยู่ไกล ๆ หรือมีเขาบ้าง", plain: "ที่ราบโล่ง แทบไม่เห็นภูเขา" },
  }),

  cold: geo({
    measure: "cold",
    prompt: "หน้าหนาวที่บ้านเกิด หนาวแค่ไหน?",
    labels: { cold: "หนาวจริง ต้องใส่แจ็กเก็ต ห่มผ้านวม", cool: "เย็นสบายแค่บางวัน", warm: "แทบไม่หนาวเลย" },
  }),

  bangkok: geo({
    measure: "bangkok-hours",
    prompt: "นั่งรถจากบ้านเกิดเข้ากรุงเทพฯ ใช้เวลาประมาณเท่าไหร่?",
    labels: {
      "bkk-1h": "อยู่กรุงเทพฯ หรือไม่ถึง 1 ชั่วโมง",
      "bkk-3h": "1 ถึง 3 ชั่วโมง",
      "bkk-6h": "3 ถึง 6 ชั่วโมง",
      "bkk-10h": "6 ถึง 10 ชั่วโมง",
      "bkk-far": "เกิน 10 ชั่วโมง",
    },
  }),

  neighbour: geo({
    measure: "neighbour",
    prompt: "ประเทศเพื่อนบ้านที่ใกล้บ้านคุณที่สุดคือประเทศไหน?",
    aside: "ดูจากแผนที่ข้าง ๆ ได้",
    labels: { MM: "เมียนมา", LA: "ลาว", KH: "กัมพูชา", MY: "มาเลเซีย" },
  }),
} as const;
