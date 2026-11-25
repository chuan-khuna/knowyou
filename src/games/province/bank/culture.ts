import { lean } from "../schema";

/** Festivals, temple-fair shows, dress, worship and pastimes. */
export const culture = {
  "temple-fair": lean({
    topic: "culture",
    prompt: "งานวัด งานบุญแถวบ้าน มักมีการแสดงอะไร?",
    options: [
      { key: "molam", label: "หมอลำ", dialect: { klang: 15, muang: 15, isan: 80, tai: 2, khmer: 45, malay: 1 } },
      { key: "so", label: "สะล้อ ซอ ซึง ฟ้อนเล็บ", dialect: { klang: 3, muang: 65, isan: 2, tai: 1, khmer: 1, malay: 1 } },
      { key: "nang-talung", label: "หนังตะลุง มโนราห์", dialect: { klang: 3, muang: 2, isan: 1, tai: 80, khmer: 1, malay: 25 } },
      { key: "likay", label: "ลิเก วงลูกทุ่ง", dialect: { klang: 75, muang: 20, isan: 17, tai: 15, khmer: 13, malay: 5 } },
      { key: "kantrum", label: "กันตรึม เจรียง", dialect: { klang: 1, isan: 3, khmer: 45 } },
    ],
  }),

  festival: lean({
    topic: "culture",
    prompt: "ประเพณีที่คนแถวบ้านตั้งตารอที่สุดคืออะไร?",
    options: [
      { key: "bang-fai", label: "บุญบั้งไฟ บุญผะเหวด", dialect: { klang: 3, muang: 5, isan: 70, tai: 1, khmer: 35, malay: 1 } },
      { key: "yi-peng", label: "ยี่เป็ง ปอยหลวง", dialect: { klang: 2, muang: 75, isan: 3, tai: 1, khmer: 1, malay: 1 } },
      { key: "sat-duean-sip", label: "สารทเดือนสิบ ชักพระ", dialect: { klang: 2, muang: 1, isan: 1, tai: 80, khmer: 1, malay: 8 } },
      { key: "hari-raya", label: "ฮารีรายอ", faith: { buddhist: 1, muslim: 150 } },
      { key: "general", label: "สงกรานต์ ลอยกระทง แบบทั่วไป", dialect: { klang: 91, muang: 17, isan: 22, tai: 15, khmer: 30, malay: 9 } },
    ],
  }),

  worship: lean({
    topic: "culture",
    prompt: "เสียงจากศาสนสถานที่ได้ยินแถวบ้านเป็นประจำคืออะไร?",
    options: [
      { key: "temple", label: "ระฆัง กลองเพลจากวัด", faith: { buddhist: 100, muslim: 2 } },
      { key: "mosque", label: "เสียงอะซานจากมัสยิด", faith: { buddhist: 0.5, muslim: 100 } },
      { key: "both", label: "ได้ยินทั้งสองอย่าง", faith: { buddhist: 4, muslim: 70 } },
      { key: "shrine", label: "เสียงประทัดจากศาลเจ้าจีน", base: 1, faith: { buddhist: 3, muslim: 1 }, tags: { chinese: 3, "jay-festival": 2 } },
    ],
  }),

  cloth: lean({
    topic: "culture",
    prompt: "ผ้าพื้นเมืองที่คนแถวบ้านนุ่งไปงานบุญคืออะไร?",
    options: [
      { key: "tin-jok", label: "ซิ่นตีนจก เสื้อหม้อห้อม", dialect: { klang: 5, muang: 70, isan: 2, tai: 1, khmer: 1, malay: 1 } },
      { key: "silk", label: "ผ้าไหม ผ้ามัดหมี่ ผ้าขิด", dialect: { klang: 5, muang: 5, isan: 75, tai: 2, khmer: 80, malay: 1 } },
      { key: "batik", label: "ผ้าปาเต๊ะ ผ้าบาติก", dialect: { klang: 2, muang: 1, isan: 1, tai: 60, khmer: 1, malay: 85 } },
      { key: "none", label: "ไม่มีผ้าเฉพาะถิ่น ใส่ชุดสุภาพทั่วไป", dialect: { klang: 88, muang: 24, isan: 22, tai: 37, khmer: 18, malay: 13 } },
    ],
  }),

  pastime: lean({
    topic: "culture",
    prompt: "การแข่งขันพื้นบ้านที่คนแถวบ้านตามดูกันจริงจังคืออะไร?",
    options: [
      { key: "boat-race", label: "แข่งเรือยาว", base: 1, tags: { "boat-race": 8 } },
      { key: "bullfight", label: "วัวชน", base: 0.3, tags: { bullfight: 30 } },
      { key: "buffalo-race", label: "วิ่งควาย", base: 0.2, tags: { "buffalo-race": 60 } },
      { key: "dove", label: "แข่งนกเขาชวาเสียง", base: 0.3, tags: { "dove-contest": 30 } },
      { key: "none", label: "ไม่มีอะไรเด่น", base: 6 },
    ],
    unsure: ["boat-race"],
  }),

  "chinese-festivals": lean({
    topic: "culture",
    prompt: "ช่วงตรุษจีนหรือเทศกาลกินเจ แถวบ้านเป็นอย่างไร?",
    options: [
      { key: "parade", label: "คึกคัก มีแห่เจ้า ตลาดปิดกันทั้งตลาด", base: 1, tags: { chinese: 9 } },
      { key: "jay", label: "ทั้งเมืองกินเจ ขึ้นธงเหลือง มีพิธีม้าทรง", base: 0.2, tags: { "jay-festival": 60, chinese: 1 } },
      { key: "some", label: "มีไหว้กันบ้างในบ้านคนจีน", base: 6, faith: { buddhist: 1, muslim: 0.3 } },
      { key: "none", label: "แทบไม่มีอะไร", base: 4, tags: { chinese: -0.8 }, faith: { buddhist: 1, muslim: 3 } },
    ],
  }),
} as const;
