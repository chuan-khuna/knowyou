import { lean } from "../schema";

const EVERY_AREA = { bangkok: 1, north: 1, northeast: 1, south: 1, east: 1 } as const;
const EVERY_SETTING = { downtown: 1, suburb: 1, town: 1, countryside: 1 } as const;

/** Campus life and traditions: what only a student there would know. */
export const life = {
  welcome: lean({
    topic: "life",
    prompt: "ตอนปี 1 รับน้องที่คณะคุณเป็นแบบไหน?",
    options: [
      { key: "sotus", label: "ห้องเชียร์ มีว้าก เข้มข้นทั้งเทอม", base: 0.4, control: { public: 1, private: 0.25 }, tags: { sotus: 8, english: -0.8 } },
      { key: "fun", label: "รับน้องสนุก ๆ เล่นเกม ไม่มีว้าก", base: 4, control: { public: 1, private: 1 }, tags: { sotus: -0.3 } },
      { key: "climb", label: "เดินขึ้นดอยหรือขึ้นเขาด้วยกันทั้งรุ่น", base: 0.1, control: { public: 1, private: 0.3 }, tags: { hill: 25 } },
      { key: "none", label: "แทบไม่มีรับน้อง ต่างคนต่างเรียน", base: 1, control: { public: 0.6, private: 1.5 }, tags: { "open-admission": 8, english: 2, "work-based": 3 } },
    ],
  }),

  commute: lean({
    topic: "life",
    prompt: "ปกติคุณเดินทางไปเรียนยังไง?",
    options: [
      { key: "rail", label: "รถไฟฟ้า BTS MRT หรือแอร์พอร์ตลิงก์", base: 0.2, setting: { downtown: 1, suburb: 0.5 }, tags: { rail: 20 } },
      { key: "bus", label: "รถเมล์ รถตู้ หรือสองแถว", setting: { downtown: 3, suburb: 3, town: 2, countryside: 1 } },
      { key: "motorbike", label: "ขี่มอเตอร์ไซค์ไปเอง", setting: { downtown: 0.5, suburb: 1.5, town: 4, countryside: 3 } },
      { key: "walk", label: "เดินหรือปั่นจักรยานจากหอใน", setting: { downtown: 0.5, suburb: 1.5, town: 2, countryside: 4 }, tags: { "first-year-dorm": 1.5 } },
      { key: "car", label: "ขับรถไปเอง หรือมีคนไปส่ง", setting: { downtown: 1.5, suburb: 2, town: 1, countryside: 0.7 } },
    ],
  }),

  around: lean({
    topic: "life",
    prompt: "ระหว่างคาบ คุณย้ายไปอีกตึกเรียนยังไง?",
    options: [
      { key: "shuttle", label: "ขึ้นรถรางหรือรถบัสฟรีของมหาวิทยาลัย", base: 0.3, setting: EVERY_SETTING, tags: { shuttle: 12 } },
      { key: "walk", label: "เดิน ตึกอยู่ใกล้ ๆ กัน", setting: { downtown: 4, suburb: 2, town: 1.5, countryside: 1 } },
      { key: "motorbike", label: "ขี่มอเตอร์ไซค์ มหาวิทยาลัยกว้างมาก", setting: { downtown: 0.2, suburb: 0.8, town: 2, countryside: 3 } },
      { key: "bike", label: "ปั่นจักรยาน", setting: { downtown: 0.2, suburb: 1.2, town: 0.8, countryside: 1.2 } },
    ],
  }),

  distance: lean({
    topic: "life",
    prompt: "จากประตูมหาวิทยาลัยเดินไปตึกเรียนที่ไกลที่สุด ใช้เวลาเท่าไหร่?",
    options: [
      { key: "near", label: "ไม่ถึง 10 นาที", setting: { downtown: 4, suburb: 2, town: 1, countryside: 0.3 }, tags: { shuttle: -0.5 } },
      { key: "mid", label: "10 ถึง 20 นาที", setting: { downtown: 1.5, suburb: 2, town: 2, countryside: 1.5 } },
      { key: "far", label: "ไกลมาก เดินไม่ไหว ต้องนั่งรถ", setting: { downtown: 0.2, suburb: 1, town: 1.5, countryside: 4 }, tags: { shuttle: 2 } },
    ],
  }),

  lunch: lean({
    topic: "life",
    prompt: "มื้อกลางวันวันเรียน ส่วนใหญ่คุณกินที่ไหน?",
    options: [
      { key: "canteen", label: "โรงอาหารของคณะหรือของมหาวิทยาลัย", setting: { downtown: 3, suburb: 3, town: 3, countryside: 4 } },
      { key: "gate", label: "ร้านหน้ามอหรือหลังมอ", setting: { downtown: 1.5, suburb: 2.5, town: 3.5, countryside: 2 } },
      { key: "mall", label: "ศูนย์อาหารในห้างหรือคอมมูนิตีมอลล์ใกล้ ๆ", setting: { downtown: 3, suburb: 1.5, town: 0.6, countryside: 0.2 } },
      { key: "store", label: "ร้านสะดวกซื้อในมหาวิทยาลัย", base: 0.4, setting: EVERY_SETTING, tags: { "work-based": 15 } },
    ],
  }),

  reading: lean({
    topic: "life",
    prompt: "ช่วงสอบ คุณอ่านหนังสือที่ไหนบ่อยที่สุด?",
    options: [
      { key: "library", label: "หอสมุดของมหาวิทยาลัย", setting: { downtown: 2, suburb: 2, town: 2, countryside: 2 } },
      { key: "cafe", label: "ร้านกาแฟหรือโคเวิร์กกิงสเปซนอกมหาวิทยาลัย", setting: { downtown: 3, suburb: 1.5, town: 1.5, countryside: 0.3 } },
      { key: "dorm", label: "ในห้องที่หอพัก", setting: { downtown: 1, suburb: 2, town: 2.5, countryside: 4 }, tags: { "first-year-dorm": 0.5 } },
      { key: "late", label: "ร้านอาหารหรือฟาสต์ฟู้ดที่เปิด 24 ชั่วโมง", setting: { downtown: 1.5, suburb: 1, town: 1, countryside: 0.3 } },
    ],
  }),

  uniform: lean({
    topic: "life",
    prompt: "วันเรียนปกติ คุณแต่งตัวไปเรียนยังไง?",
    options: [
      { key: "strict", label: "ชุดนักศึกษาถูกระเบียบทุกวัน มีคนตรวจ", base: 0.5, fields: { health: 1, tech: 1, business: 1, arts: 1, social: 1 }, tags: { uniform: 10 } },
      { key: "mostly", label: "ชุดนักศึกษาเป็นส่วนใหญ่ แต่ไม่เคร่ง", base: 3, fields: { health: 1, tech: 1, business: 1, arts: 1, social: 1 } },
      { key: "shop", label: "เสื้อช็อปหรือเสื้อคณะ", fields: { health: 0.5, tech: 3, business: 0.3, arts: 0.3, social: 0.3 }, tags: { uniform: -0.5 } },
      { key: "casual", label: "ชุดไปรเวท แทบไม่ใส่ชุดนักศึกษา", base: 1.5, fields: { health: 0.5, tech: 0.8, business: 1, arts: 3, social: 1.5 }, tags: { english: 3, uniform: -0.8 } },
    ],
  }),

  event: lean({
    topic: "life",
    prompt: "งานไหนที่คนทั้งมหาวิทยาลัยตั้งตารอที่สุด?",
    options: [
      { key: "football", label: "ฟุตบอลประเพณี มีแปรอักษร", base: 0.05, tags: { "football-classic": 200 } },
      { key: "farm-fair", label: "งานเกษตรแฟร์หรืองานเกษตรประจำปี", base: 0.1, tags: { farm: 20 } },
      { key: "freshy", label: "งานกีฬาน้องใหม่ หรือคอนเสิร์ตเฟรชชี่", base: 3 },
      { key: "loy", label: "ลอยกระทงที่อ่างหรือบึงในมหาวิทยาลัย", base: 0.3, tags: { lake: 10 } },
      { key: "festive", label: "คริสต์มาสหรือตรุษจีนในมหาวิทยาลัย", base: 0.1, tags: { christian: 25, chinese: 15 } },
    ],
  }),

  centre: lean({
    topic: "life",
    prompt: "ใจกลางมหาวิทยาลัยของคุณมีอะไร?",
    options: [
      { key: "water", label: "อ่างเก็บน้ำหรือบึงใหญ่", base: 0.3, setting: EVERY_SETTING, tags: { lake: 15 } },
      { key: "lawn", label: "สนามหญ้ากว้างกับตึกเก่า", setting: { downtown: 2, suburb: 1.5, town: 1.5, countryside: 1 } },
      { key: "towers", label: "ตึกเรียนสูง ๆ กับลานจอดรถ", setting: { downtown: 3, suburb: 1.5, town: 0.5, countryside: 0.3 } },
      { key: "green", label: "แปลงเกษตร ทุ่งหญ้า หรือป่า", setting: { downtown: 0.1, suburb: 0.4, town: 0.6, countryside: 2 }, tags: { farm: 3 } },
    ],
  }),

  "night-market": lean({
    topic: "life",
    prompt: "จากมหาวิทยาลัยไปตลาดนัดกลางคืนที่เพื่อน ๆ ไปกันบ่อย ไกลแค่ไหน?",
    options: [
      { key: "walk", label: "เดินไปได้ อยู่หน้ามอเลย", setting: { downtown: 2, suburb: 2, town: 3, countryside: 1.5 } },
      { key: "ride", label: "นั่งรถไม่เกิน 20 นาที", setting: { downtown: 2, suburb: 2, town: 1.5, countryside: 1.5 } },
      { key: "far", label: "ต้องเข้าเมือง เกินครึ่งชั่วโมง", setting: { downtown: 0.2, suburb: 0.5, town: 0.2, countryside: 2 } },
    ],
  }),

  dorm: lean({
    topic: "life",
    prompt: "ตอนปี 1 คุณพักที่ไหน?",
    options: [
      { key: "campus", label: "หอในของมหาวิทยาลัย", setting: { downtown: 0.3, suburb: 1, town: 1.5, countryside: 2 }, tags: { "first-year-dorm": 8 } },
      { key: "outside", label: "หอนอกหรืออพาร์ตเมนต์แถวมหาวิทยาลัย", setting: { downtown: 2, suburb: 3, town: 3, countryside: 2 } },
      { key: "home", label: "อยู่บ้าน เดินทางไปเรียน", setting: { downtown: 4, suburb: 2.5, town: 1, countryside: 0.3 } },
    ],
  }),

  faith: lean({
    topic: "life",
    prompt: "ในมหาวิทยาลัย อะไรเกี่ยวกับศาสนาที่คุณคุ้นที่สุด?",
    options: [
      { key: "statue", label: "ไหว้พระรูปหรืออนุสาวรีย์ประจำมหาวิทยาลัยก่อนสอบ", area: EVERY_AREA, control: { public: 3, private: 1 } },
      { key: "chapel", label: "โบสถ์คริสต์ นมัสการ และคริสต์มาสใหญ่", base: 0.1, area: EVERY_AREA, control: { public: 0.2, private: 1 }, tags: { christian: 40 } },
      { key: "shrine", label: "ศาลเจ้าหรือพิธีไหว้เจ้าแบบจีน", base: 0.1, area: EVERY_AREA, control: { public: 0.2, private: 1 }, tags: { chinese: 15 } },
      { key: "prayer", label: "ห้องละหมาด มีเพื่อนมุสลิมเยอะ", area: { bangkok: 0.3, north: 0.1, northeast: 0.05, south: 4, east: 0.2 }, control: { public: 1, private: 0.5 } },
      { key: "none", label: "ไม่มีอะไรเป็นพิเศษ", area: EVERY_AREA, control: { public: 2, private: 3 } },
    ],
    unsure: ["prayer"],
  }),

  mall: lean({
    topic: "life",
    prompt: "ห้างที่คุณกับเพื่อนไปเดินบ่อยที่สุดตอนเรียนคือที่ไหน?",
    options: [
      { key: "siam", label: "สยาม สามย่าน หรือ MBK", base: 0.15, area: { bangkok: 1 } },
      { key: "future", label: "ฟิวเจอร์พาร์ค รังสิต", base: 0.1, area: { bangkok: 1 }, tags: { rangsit: 60 } },
      { key: "bangkok", label: "ห้างอื่นในกรุงเทพฯ หรือปริมณฑล", base: 3, area: { bangkok: 1 }, tags: { rangsit: -0.7 } },
      { key: "provincial", label: "ห้างในตัวเมืองต่างจังหวัด", base: 3, area: { north: 1, northeast: 1, south: 1, east: 1 } },
      { key: "none", label: "แทบไม่ได้ไปห้าง", base: 0.5, area: EVERY_AREA },
    ],
    override: { chula: { siam: 10, future: 0.1, bangkok: 1.5, none: 0.3 } },
  }),

  farm: lean({
    topic: "life",
    prompt: "ในมหาวิทยาลัยมีร้านขายนม ไข่ หรือผักจากฟาร์มของมหาวิทยาลัยไหม?",
    options: [
      { key: "famous", label: "มี ของจากฟาร์มมหาวิทยาลัยขึ้นชื่อมาก", base: 0.1, tags: { farm: 40 } },
      { key: "some", label: "มี แต่ไม่ค่อยได้ซื้อ", base: 1, tags: { farm: 3 } },
      { key: "no", label: "ไม่มี", base: 4, tags: { farm: -0.8 } },
    ],
  }),

  weekend: lean({
    topic: "life",
    prompt: "เสาร์อาทิตย์ เพื่อนส่วนใหญ่ทำอะไร?",
    options: [
      { key: "home", label: "กลับบ้าน เพราะบ้านอยู่ไม่ไกล", setting: { downtown: 1.5, suburb: 2, town: 2.5, countryside: 2.5 } },
      { key: "city", label: "เดินห้าง ดูหนัง ในเมือง", setting: { downtown: 3, suburb: 2.5, town: 2, countryside: 1 } },
      { key: "nature", label: "ขึ้นดอย ไปน้ำตก หรือไปทะเล", base: 0.6, setting: { downtown: 0.3, suburb: 0.4, town: 1.5, countryside: 1.5 }, tags: { hill: 4, sea: 4 } },
      { key: "work", label: "ทำงานพาร์ตไทม์", setting: EVERY_SETTING, tags: { "work-based": 10 } },
    ],
  }),
} as const;
