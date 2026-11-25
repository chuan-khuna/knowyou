import { lean } from "../schema";

/**
 * How people at home talk. Weights are relative, roughly per 100 speakers of
 * each dialect; a dialect an option leaves out counts 0 for that option.
 */
export const language = {
  speak: lean({
    topic: "language",
    prompt: "คนแถวบ้านเรียกการ “พูด” ว่าอะไร?",
    aside: "แบบที่คุยกันเองในบ้าน ไม่ใช่ภาษาในโรงเรียน",
    options: [
      { key: "phut", label: "พูด", dialect: { klang: 90, muang: 15, isan: 10, tai: 10, khmer: 25, malay: 30 } },
      { key: "u", label: "อู้", dialect: { muang: 80, klang: 2 } },
      { key: "wao", label: "เว้า", dialect: { isan: 85, khmer: 45, klang: 3 } },
      { key: "laeng", label: "แหลง", dialect: { tai: 85, malay: 40 } },
    ],
  }),

  delicious: lean({
    topic: "language",
    prompt: "ถ้าอาหารอร่อยมาก ๆ คนแถวบ้านพูดว่าอะไร?",
    options: [
      { key: "aroi", label: "อร่อยจัง / อร่อยมาก", dialect: { klang: 92, muang: 25, isan: 10, tai: 10, khmer: 30, malay: 40 } },
      { key: "lam", label: "ลำแต้ / ลำขนาด", dialect: { klang: 2, muang: 70, isan: 2, tai: 1, khmer: 1, malay: 1 } },
      { key: "saep", label: "แซบหลาย / แซบอีหลี", dialect: { klang: 4, muang: 4, isan: 87, tai: 1, khmer: 68, malay: 1 } },
      { key: "roi", label: "หรอยจังหู / หรอยแรง", dialect: { klang: 2, muang: 1, isan: 1, tai: 88, khmer: 1, malay: 58 } },
    ],
  }),

  papaya: lean({
    topic: "language",
    prompt: "“มะละกอ” คนแถวบ้านเรียกว่าอะไร?",
    options: [
      { key: "malako", label: "มะละกอ", dialect: { klang: 95, muang: 30, isan: 12, tai: 15, khmer: 25, malay: 35 } },
      { key: "bakhung", label: "บักหุ่ง / หมากหุ่ง", dialect: { klang: 2, muang: 5, isan: 86, tai: 1, khmer: 70, malay: 1 } },
      { key: "makuaitet", label: "มะก๊วยเต๊ด", dialect: { klang: 2, muang: 63, isan: 1, tai: 1, khmer: 2, malay: 1 } },
      { key: "loko", label: "ลอกอ", dialect: { klang: 1, muang: 2, isan: 1, tai: 83, khmer: 3, malay: 63 } },
    ],
  }),

  "khanom-jeen": lean({
    topic: "language",
    prompt: "เส้นขาว ๆ ที่กินกับน้ำยาหรือน้ำเงี้ยว ที่บ้านเรียกว่าอะไร?",
    options: [
      { key: "khanom-jeen", label: "ขนมจีน", dialect: { klang: 92, muang: 25, isan: 10, tai: 15, khmer: 25, malay: 40 } },
      { key: "khanom-sen", label: "ขนมเส้น / ข้าวเส้น", dialect: { klang: 3, muang: 72, isan: 2, tai: 1, khmer: 1, malay: 1 } },
      { key: "khao-pun", label: "ข้าวปุ้น", dialect: { klang: 3, muang: 2, isan: 87, tai: 1, khmer: 73, malay: 1 } },
      { key: "nom-jeen", label: "หนมจีน", hint: "กินเป็นมื้อเช้ากับผักเหนาะ", dialect: { klang: 2, muang: 1, isan: 1, tai: 83, khmer: 1, malay: 58 } },
    ],
  }),

  what: lean({
    topic: "language",
    prompt: "ถ้าจะถามว่า “อะไร” คนแถวบ้านพูดว่าอะไร?",
    options: [
      { key: "arai", label: "อะไร", dialect: { klang: 92, muang: 20, isan: 10, tai: 25, khmer: 25, malay: 35 } },
      { key: "ahyang", label: "อะหยัง", dialect: { klang: 2, muang: 75, isan: 3 } },
      { key: "ihyang", label: "อีหยัง / หยัง", dialect: { klang: 3, muang: 5, isan: 85, khmer: 70 } },
      { key: "rai", label: "ไหร / ไอ้ไหร", dialect: { klang: 2, tai: 75, malay: 50 } },
    ],
    unsure: ["rai"],
  }),

  beautiful: lean({
    topic: "language",
    prompt: "ถ้าจะชมว่า “สวยมาก” คนแถวบ้านพูดว่าอะไร?",
    options: [
      { key: "suai-mak", label: "สวยมาก / สวยจัง", dialect: { klang: 90, muang: 20, isan: 15, tai: 25, khmer: 30, malay: 40 } },
      { key: "ngam-khanat", label: "งามขนาด / งามแต้", dialect: { klang: 2, muang: 75, isan: 3 } },
      { key: "ngam-lai", label: "งามหลาย / งามอีหลี", dialect: { klang: 3, muang: 3, isan: 80, khmer: 65 } },
      { key: "ngam-raeng", label: "งามจังหู / งามแรง", dialect: { klang: 2, tai: 72, malay: 50 } },
    ],
    unsure: ["ngam-raeng"],
  }),

  grandmother: lean({
    topic: "language",
    prompt: "ที่บ้านเรียก “ยาย” (แม่ของแม่) ว่าอะไร?",
    options: [
      { key: "yai", label: "ยาย", dialect: { klang: 90, muang: 20, isan: 35, tai: 70, khmer: 30, malay: 15 } },
      { key: "ui", label: "อุ๊ย / แม่อุ๊ย", dialect: { klang: 2, muang: 75, isan: 2 } },
      { key: "mae-yai", label: "แม่ใหญ่ / แม่เฒ่า", dialect: { klang: 5, muang: 5, isan: 60, tai: 25, khmer: 40, malay: 5 } },
      { key: "tok", label: "โต๊ะ / มะ", hint: "แบบภาษามลายู", dialect: { tai: 3, malay: 75 } },
    ],
    unsure: ["mae-yai", "tok"],
  }),

  accent: lean({
    topic: "language",
    prompt: "สำเนียงที่คนแถวบ้านพูดกัน ใกล้แบบไหนที่สุด?",
    options: [
      { key: "bangkok", label: "ภาษากลางแบบกรุงเทพฯ", dialect: { klang: 90, muang: 5, isan: 5, tai: 5, khmer: 5, malay: 5 }, tags: { "suphan-accent": -0.8, "eastern-accent": -0.7 } },
      { key: "suphan", label: "เหน่อแบบสุพรรณ", hint: "แถบสุพรรณ กาญจน์ ราชบุรี เพชรบุรี", dialect: { klang: 4 }, tags: { "suphan-accent": 60 } },
      { key: "eastern", label: "สำเนียงตะวันออก", hint: "แบบระยอง จันท์ ตราด", dialect: { klang: 3 }, tags: { "eastern-accent": 60 } },
      { key: "other", label: "ภาษาถิ่นอื่น", hint: "คำเมือง อีสาน ใต้ เขมร หรือมลายู", dialect: { klang: 3, muang: 95, isan: 95, tai: 95, khmer: 95, malay: 95 } },
    ],
  }),

  "home-languages": lean({
    topic: "language",
    prompt: "นอกจากภาษาไทยและภาษาถิ่น แถวบ้านมีคนพูดภาษาอะไรกันเยอะ?",
    options: [
      { key: "none", label: "ไม่มี พูดไทยกันหมด", base: 70, tags: { chinese: -0.4, "hill-peoples": -0.5, mon: -0.3 }, dialect: { klang: 1, muang: 1, isan: 1, tai: 1, khmer: 0.2, malay: 0.05 } },
      { key: "khmer", label: "เขมร หรือกูย (ส่วย)", base: 1, dialect: { klang: 2, isan: 5, khmer: 600, tai: 1, muang: 1, malay: 1 } },
      { key: "malay", label: "มลายู (ยาวี)", base: 1, dialect: { klang: 1, isan: 1, khmer: 1, tai: 8, muang: 1, malay: 1000 } },
      { key: "chinese", label: "จีน แต้จิ๋ว ฮกเกี้ยน หรือไหหลำ", base: 6, tags: { chinese: 6 }, dialect: { klang: 1, muang: 1, isan: 1, tai: 1, khmer: 1, malay: 1 } },
      { key: "hill", label: "มอญ พม่า ไทใหญ่ กะเหรี่ยง หรือชาวเขา", base: 4, tags: { "hill-peoples": 9, mon: 5 }, dialect: { klang: 1, muang: 1, isan: 0.3, tai: 0.3, khmer: 0.3, malay: 0.3 } },
    ],
  }),
} as const;
