import { lean } from "../schema";

const EVERY_DIALECT = { klang: 10, muang: 10, isan: 10, tai: 10, khmer: 10, malay: 10 } as const;

/** The food the player grew up with. */
export const food = {
  rice: lean({
    topic: "food",
    prompt: "ข้าวที่บ้านกินเป็นหลักทุกวันคือข้าวอะไร?",
    options: [
      { key: "sticky", label: "ข้าวเหนียว", dialect: { klang: 5, muang: 60, isan: 80, tai: 1, khmer: 55, malay: 1 } },
      { key: "steamed", label: "ข้าวสวย", dialect: { klang: 85, muang: 15, isan: 5, tai: 95, khmer: 15, malay: 95 } },
      { key: "both", label: "พอ ๆ กัน", dialect: { klang: 10, muang: 25, isan: 15, tai: 4, khmer: 30, malay: 4 } },
    ],
  }),

  pantry: lean({
    topic: "food",
    prompt: "ของหมักที่ต้องมีติดครัวที่บ้านเสมอคืออะไร?",
    options: [
      { key: "pla-ra", label: "ปลาร้า", dialect: { klang: 8, muang: 20, isan: 85, tai: 2, khmer: 80, malay: 1 } },
      { key: "nam-pu", label: "น้ำปู๋ หรือถั่วเน่า", dialect: { klang: 1, muang: 55, isan: 2, tai: 1, khmer: 1, malay: 1 } },
      { key: "tai-pla", label: "ไตปลา", dialect: { klang: 2, muang: 1, isan: 1, tai: 65, khmer: 1, malay: 10 } },
      { key: "budu", label: "บูดู", dialect: { klang: 1, muang: 1, isan: 1, tai: 12, khmer: 1, malay: 80 } },
      { key: "fish-sauce", label: "น้ำปลาอย่างเดียวก็พอ", dialect: { klang: 88, muang: 23, isan: 11, tai: 20, khmer: 17, malay: 8 } },
    ],
  }),

  breakfast: lean({
    topic: "food",
    prompt: "มื้อเช้าที่คุ้นที่สุดตอนเด็กคืออะไร?",
    options: [
      { key: "congee", label: "ข้าวต้ม โจ๊ก ปาท่องโก๋", dialect: { klang: 60, muang: 25, isan: 15, tai: 15, khmer: 15, malay: 5 } },
      { key: "sticky-rice", label: "ข้าวเหนียวกับกับข้าวพื้นบ้าน", dialect: { klang: 5, muang: 55, isan: 70, tai: 1, khmer: 65, malay: 1 } },
      { key: "khanom-jeen", label: "ขนมจีน หรือข้าวยำ", dialect: { klang: 5, muang: 3, isan: 5, tai: 50, khmer: 5, malay: 45 } },
      { key: "roti", label: "โรตี กับชาชัก", dialect: { klang: 2, tai: 15, malay: 45 }, faith: { muslim: 100, buddhist: 15 } },
      { key: "dim-sum", label: "ติ่มซำ กับกาแฟร้านโกปี๊", dialect: { klang: 3, tai: 6, malay: 3 }, tags: { "dimsum-breakfast": 12, chinese: 1 } },
    ],
    unsure: ["roti"],
  }),

  "nam-phrik": lean({
    topic: "food",
    prompt: "น้ำพริกที่บ้านกินบ่อยที่สุดคืออะไร?",
    options: [
      { key: "kapi", label: "น้ำพริกกะปิ กับผักต้ม", dialect: { klang: 75, muang: 8, isan: 5, tai: 15, khmer: 10, malay: 10 } },
      { key: "num-ong", label: "น้ำพริกหนุ่ม น้ำพริกอ่อง", dialect: { klang: 5, muang: 80, isan: 3, tai: 1, khmer: 1, malay: 1 } },
      { key: "jaew", label: "แจ่ว ป่น", dialect: { klang: 5, muang: 5, isan: 85, tai: 1, khmer: 75, malay: 1 } },
      { key: "nam-chup", label: "น้ำชุบ กับผักเหนาะ", dialect: { klang: 2, muang: 1, isan: 1, tai: 75, khmer: 1, malay: 40 } },
      { key: "sambal", label: "ซัมบัล หรือน้ำบูดู", dialect: { tai: 5, malay: 45 } },
    ],
    unsure: ["sambal"],
  }),

  noodle: lean({
    topic: "food",
    prompt: "เมนูเส้นที่ร้านแถวบ้านขายดีที่สุดคืออะไร?",
    options: [
      { key: "boat", label: "ก๋วยเตี๋ยวเรือ ก๋วยเตี๋ยวน้ำใส", dialect: { klang: 75, muang: 20, isan: 20, tai: 20, khmer: 20, malay: 15 } },
      { key: "khao-soi", label: "ข้าวซอย ขนมเส้นน้ำเงี้ยว", dialect: { klang: 2, muang: 70, isan: 2 } },
      { key: "khao-piak", label: "ข้าวเปียกเส้น", dialect: { klang: 3, muang: 3, isan: 70, khmer: 60, tai: 1 } },
      { key: "southern-curry", label: "ขนมจีนแกงไตปลา น้ำยาปักษ์ใต้", dialect: { klang: 2, tai: 70, malay: 40 } },
      { key: "mee", label: "หมี่ฮกเกี้ยน บะหมี่จีน", dialect: { klang: 8, muang: 2, isan: 2, tai: 6, malay: 6 }, tags: { chinese: 3, "dimsum-breakfast": 3 } },
    ],
  }),

  dessert: lean({
    topic: "food",
    prompt: "ขนมพื้นบ้านที่คุ้นที่สุดตอนเด็กคืออะไร?",
    options: [
      { key: "khanom-chan", label: "ขนมชั้น ทองหยิบ ฝอยทอง", dialect: { klang: 75, muang: 15, isan: 15, tai: 15, khmer: 15, malay: 10 } },
      { key: "khao-taen", label: "ข้าวแต๋น ขนมจ๊อก", dialect: { klang: 2, muang: 70, isan: 3 } },
      { key: "khao-ji", label: "ข้าวจี่ ข้าวโป่ง", dialect: { klang: 3, muang: 10, isan: 75, khmer: 65 } },
      { key: "khanom-la", label: "ขนมลา ขนมเจาะหู", dialect: { klang: 2, tai: 75, malay: 20 } },
      { key: "malay-sweets", label: "ขนมแบบมลายู เช่น ตูปะซูตง", dialect: { tai: 3, malay: 60 } },
    ],
    unsure: ["malay-sweets"],
  }),

  sausage: lean({
    topic: "food",
    prompt: "ไส้กรอกแบบไหนที่บ้านกินบ่อยที่สุด?",
    options: [
      { key: "sai-ua", label: "ไส้อั่ว", dialect: { klang: 2, muang: 80, isan: 3, tai: 1, khmer: 1, malay: 1 }, faith: { buddhist: 1, muslim: 0.02 } },
      { key: "sai-krok-isan", label: "ไส้กรอกอีสาน", dialect: { klang: 15, muang: 10, isan: 85, tai: 5, khmer: 80, malay: 2 }, faith: { buddhist: 1, muslim: 0.02 } },
      { key: "kun-chiang", label: "กุนเชียง หมูยอ", dialect: { klang: 70, muang: 8, isan: 10, tai: 80, khmer: 10, malay: 30 }, faith: { buddhist: 1, muslim: 0.02 } },
      { key: "no-pork", label: "ไม่กินหมู", hint: "ที่บ้านกินฮาลาล", dialect: EVERY_DIALECT, faith: { buddhist: 0.02, muslim: 9 } },
    ],
  }),

  larb: lean({
    topic: "food",
    prompt: "ลาบที่บ้านทำเป็นแบบไหน?",
    options: [
      { key: "larb-nuea", label: "ลาบคั่ว ใส่มะแขว่น พริกลาบ", dialect: { klang: 3, muang: 80, isan: 5, tai: 1, khmer: 2, malay: 1 } },
      { key: "larb-isan", label: "ลาบใส่ข้าวคั่ว บีบมะนาว", dialect: { klang: 25, muang: 10, isan: 85, tai: 10, khmer: 80, malay: 5 } },
      { key: "rarely", label: "ไม่ค่อยได้ทำลาบกิน", dialect: { klang: 70, muang: 8, isan: 8, tai: 85, khmer: 15, malay: 90 } },
    ],
  }),

  "curry-scent": lean({
    topic: "food",
    prompt: "แกงที่บ้านทำบ่อย มักมีกลิ่นอะไรเด่น?",
    options: [
      { key: "coconut", label: "กะทิ พริกแกง", hint: "แกงเขียวหวาน แกงเผ็ด แกงคั่ว", dialect: { klang: 75, muang: 10, isan: 8, tai: 15, khmer: 10, malay: 15 } },
      { key: "northern", label: "มะแขว่น ผงฮังเล", hint: "แกงฮังเล แกงแค แกงโฮะ", dialect: { klang: 3, muang: 80, isan: 3 } },
      { key: "isan", label: "ปลาร้า ผักชีลาว", hint: "แกงอ่อม แกงหน่อไม้", dialect: { klang: 5, muang: 5, isan: 85, khmer: 80, tai: 1 } },
      { key: "turmeric", label: "ขมิ้น เผ็ดจัด", hint: "แกงเหลือง แกงไตปลา คั่วกลิ้ง", dialect: { klang: 5, tai: 80, malay: 30 } },
      { key: "spices", label: "เครื่องเทศ", hint: "แกงมัสมั่น กุรุหม่า ซุปแขก", dialect: { klang: 3, tai: 5, malay: 50 }, faith: { muslim: 3, buddhist: 1 } },
    ],
  }),

  fruit: lean({
    topic: "food",
    prompt: "หน้าผลไม้ ที่บ้านได้ผลไม้อะไรเยอะจนต้องแจก?",
    options: [
      { key: "longan", label: "ลำไย ลิ้นจี่", region: { north: 70, northeast: 5, central: 3, east: 5, west: 3, south: 1 } },
      { key: "durian", label: "ทุเรียน มังคุด เงาะ ลองกอง", region: { north: 3, northeast: 3, central: 8, east: 70, west: 15, south: 65 } },
      { key: "mango", label: "มะม่วง มะขาม", region: { north: 10, northeast: 40, central: 50, east: 15, west: 30, south: 5 } },
      { key: "pomelo", label: "ส้มโอ มะพร้าว", region: { north: 2, northeast: 3, central: 25, east: 8, west: 30, south: 15 } },
      { key: "none", label: "ไม่มีผลไม้เด่น", region: { north: 15, northeast: 50, central: 15, east: 5, west: 20, south: 15 } },
    ],
    override: {
      uttaradit: { durian: 60, longan: 25, none: 10, mango: 5 },
      sisaket: { durian: 40, mango: 20, none: 40 },
      nonthaburi: { durian: 40, mango: 20, pomelo: 20, none: 20 },
      "prachin-buri": { durian: 45, mango: 30, none: 25 },
      "nakhon-pathom": { pomelo: 60, mango: 15, none: 25 },
      "chai-nat": { pomelo: 55, mango: 20, none: 25 },
      phichit: { pomelo: 50, mango: 20, none: 30 },
      "samut-songkhram": { pomelo: 60, mango: 10, none: 30 },
      "prachuap-khiri-khan": { pomelo: 50, durian: 15, mango: 10, none: 25 },
      chachoengsao: { mango: 60, pomelo: 10, none: 30 },
      phetchabun: { mango: 75, none: 25 },
      "nakhon-nayok": { mango: 60, durian: 10, none: 30 },
    },
    unsure: ["pomelo"],
  }),
} as const;
