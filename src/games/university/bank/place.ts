import { lean } from "../schema";

const EVERY_SETTING = { downtown: 1, suburb: 1, town: 1, countryside: 1 } as const;

/** At most five, at the user's request: the game should not feel like a quiz about the university. */
export const place = {
  area: lean({
    topic: "place",
    prompt: "มหาวิทยาลัยของคุณอยู่ภาคไหน?",
    options: [
      { key: "bangkok", label: "กรุงเทพและปริมณฑล", area: { bangkok: 1 } },
      { key: "north", label: "ภาคเหนือ", area: { north: 1 } },
      { key: "northeast", label: "ภาคอีสาน", area: { northeast: 1 } },
      { key: "south", label: "ภาคใต้", area: { south: 1 } },
      { key: "east", label: "ภาคตะวันออก", area: { east: 1 } },
    ],
  }),

  setting: lean({
    topic: "place",
    prompt: "รอบ ๆ มหาวิทยาลัยเป็นแบบไหน?",
    options: [
      { key: "downtown", label: "กลางเมืองใหญ่ รถติด ตึกสูง", setting: { downtown: 1 } },
      { key: "suburb", label: "ชานเมือง มีหมู่บ้านจัดสรรกับห้าง", setting: { suburb: 1 } },
      { key: "town", label: "ในตัวเมืองต่างจังหวัด", setting: { town: 1 } },
      { key: "countryside", label: "นอกเมือง ทุ่งนา ป่า หรือเขา", setting: { countryside: 1 } },
    ],
  }),

  fees: lean({
    topic: "place",
    prompt: "ค่าเทอมของคุณประมาณเทอมละเท่าไหร่?",
    options: [
      { key: "low", label: "ไม่ถึง 15,000 บาท", control: { public: 2, private: 0.1 }, fields: { health: 0.3, tech: 0.8, business: 1, arts: 0.8, social: 1.2 }, tags: { "open-admission": 5 } },
      { key: "mid", label: "15,000 ถึง 30,000 บาท", control: { public: 3, private: 1 }, fields: { health: 0.8, tech: 1, business: 1, arts: 1, social: 1 } },
      { key: "high", label: "30,000 ถึง 60,000 บาท", control: { public: 0.8, private: 3 }, fields: { health: 1.2, tech: 1, business: 1, arts: 1, social: 0.8 } },
      { key: "top", label: "เกิน 60,000 บาท", control: { public: 0.15, private: 1 }, fields: { health: 3, tech: 0.8, business: 0.8, arts: 0.8, social: 0.5 }, tags: { english: 3 } },
    ],
    unsure: ["low", "top"],
  }),

  view: lean({
    topic: "place",
    prompt: "มองออกไปจากตึกเรียน เห็นอะไรเป็นหลัก?",
    options: [
      { key: "towers", label: "ตึกสูงและรถติด", setting: { downtown: 5, suburb: 1, town: 0.3, countryside: 0.1 } },
      { key: "hills", label: "ดอยหรือภูเขา", base: 0.2, setting: EVERY_SETTING, tags: { hill: 30 } },
      { key: "sea", label: "ทะเล", base: 0.05, setting: EVERY_SETTING, tags: { sea: 60 } },
      { key: "fields", label: "ทุ่งนาหรือที่โล่ง", setting: { downtown: 0.1, suburb: 1.5, town: 1, countryside: 4 } },
      { key: "houses", label: "บ้านเรือนและร้านค้า", setting: { downtown: 1.5, suburb: 3, town: 4, countryside: 1 } },
    ],
  }),

  cold: lean({
    topic: "place",
    prompt: "หน้าหนาว ต้องใส่เสื้อกันหนาวไปเรียนไหม?",
    options: [
      { key: "cold", label: "ต้องใส่ทุกเช้า หนาวจริง", area: { bangkok: 0.1, north: 6, northeast: 3, south: 0.02, east: 0.1 }, tags: { hill: 1 } },
      { key: "cool", label: "บางวันเย็นสบาย", area: { bangkok: 2, north: 2, northeast: 3, south: 0.5, east: 1.5 } },
      { key: "warm", label: "ไม่ต้องเลย ร้อนทั้งปี", area: { bangkok: 3, north: 0.2, northeast: 0.8, south: 4, east: 3 } },
    ],
  }),
} as const;
