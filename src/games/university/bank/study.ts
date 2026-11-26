import { lean } from "../schema";

const EVERY_AREA = { bangkok: 1, north: 1, northeast: 1, south: 1, east: 1 } as const;
const PROVINCES_AREA = { bangkok: 0.1, north: 4, northeast: 4, south: 4, east: 3 } as const;

/** What and how the player studied. */
export const study = {
  field: lean({
    topic: "study",
    prompt: "คณะที่คุณเรียนอยู่ในกลุ่มไหน?",
    options: [
      { key: "health", label: "แพทย์ พยาบาล เภสัช และสายสุขภาพ", fields: { health: 1 } },
      { key: "tech", label: "วิศวะ วิทยาศาสตร์ ไอที และเกษตร", fields: { tech: 1 } },
      { key: "business", label: "บริหารธุรกิจ บัญชี และเศรษฐศาสตร์", fields: { business: 1 } },
      { key: "arts", label: "นิเทศ ศิลปกรรม ออกแบบ และสถาปัตย์", fields: { arts: 1 } },
      { key: "social", label: "มนุษยศาสตร์ สังคมศาสตร์ ครุศาสตร์ และนิติศาสตร์", fields: { social: 1 } },
    ],
  }),

  language: lean({
    topic: "study",
    prompt: "นอกจากภาษาไทย ภาษาที่คุณต้องใช้เรียนมากที่สุดคือภาษาอะไร?",
    options: [
      { key: "english-medium", label: "ภาษาอังกฤษ เรียนเป็นภาษาอังกฤษเกือบทุกวิชา", base: 0.15, tags: { english: 40 } },
      { key: "chinese", label: "ภาษาจีน ต้องเรียนหลายตัว", base: 0.1, tags: { chinese: 25 } },
      { key: "japanese", label: "ภาษาญี่ปุ่น ต้องเรียนทุกเทอม", base: 0.02, tags: { japanese: 500 } },
      { key: "english-basic", label: "ภาษาอังกฤษพื้นฐานไม่กี่ตัว ที่เหลือเรียนภาษาไทย", base: 5, tags: { english: -0.7 } },
    ],
  }),

  admission: lean({
    topic: "study",
    prompt: "คุณเข้ามหาวิทยาลัยนี้ได้ยังไง?",
    options: [
      { key: "central", label: "สอบแข่งขันรอบรับกลาง (แอดมิชชัน)", area: { bangkok: 1.5, north: 1, northeast: 1, south: 1, east: 1 }, control: { public: 3, private: 0.3 }, tags: { "open-admission": -0.9 } },
      { key: "quota", label: "โควตาหรือรับตรงสำหรับคนในภาค", area: PROVINCES_AREA, control: { public: 1, private: 0.2 }, tags: { "open-admission": -0.9 } },
      { key: "direct", label: "สมัครตรงกับมหาวิทยาลัย ยื่นเกรดหรือสัมภาษณ์", area: EVERY_AREA, control: { public: 0.6, private: 4 } },
      { key: "open", label: "ไม่ต้องสอบเข้า สมัครแล้วเรียนได้เลย", base: 0.05, area: EVERY_AREA, control: { public: 1, private: 0.5 }, tags: { "open-admission": 100 } },
    ],
  }),

  classmates: lean({
    topic: "study",
    prompt: "เพื่อนร่วมรุ่นส่วนใหญ่มาจากไหน?",
    options: [
      { key: "nationwide", label: "มาจากทุกภาคทั่วประเทศ", area: { bangkok: 2, north: 0.8, northeast: 0.8, south: 0.8, east: 0.8 }, control: { public: 3, private: 0.5 } },
      { key: "region", label: "ส่วนใหญ่มาจากจังหวัดใกล้ ๆ ในภาคเดียวกัน", area: PROVINCES_AREA, control: { public: 2, private: 1.5 } },
      { key: "bangkok", label: "ส่วนใหญ่เป็นคนกรุงเทพฯ และปริมณฑล", area: { bangkok: 4, north: 0.1, northeast: 0.1, south: 0.1, east: 0.1 }, control: { public: 0.8, private: 3 } },
      { key: "foreign", label: "มีเพื่อนต่างชาติเยอะมาก", base: 0.15, area: EVERY_AREA, control: { public: 1, private: 1 }, tags: { english: 15, chinese: 6 } },
    ],
  }),

  calendar: lean({
    topic: "study",
    prompt: "ปีการศึกษาหนึ่งของคุณแบ่งเป็นกี่ภาค?",
    options: [
      { key: "two", label: "2 ภาค ตามปกติ", base: 6, tags: { trimester: -0.9, "work-based": -0.9 } },
      { key: "three", label: "3 ภาค แบบไตรภาค", base: 0.1, tags: { trimester: 80 } },
      { key: "work", label: "เรียนสลับกับไปทำงานเป็นช่วง ๆ", base: 0.05, tags: { "work-based": 200 } },
    ],
  }),
} as const;
