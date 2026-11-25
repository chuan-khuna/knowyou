/**
 * Titles from the cable, VCD and early web years, when Ch.9's mornings still
 * ran but teenagers moved to fansubs and YouTube.
 * Airing facts are written from memory; doubtful ones are listed in `unsure`.
 */

import { film, series, type BankPart } from "../schema";

export const webEra = {
  "spirited-away": film({
    title: "มิติวิญญาณมหัศจรรย์",
    aside: "Spirited Away ของสตูดิโอจิบลิ",
    released: 2002,
    later: [
      { on: "home-video", from: 2003, to: 2010 },
      { on: "streaming", from: 2020, to: "now" },
    ],
    audience: "general",
    reach: "known",
    unsure: ["released", "later"],
  }),
  "one-piece": series({
    title: "วันพีซ",
    aside: "ลูฟี่กับกลุ่มโจรสลัดหมวกฟาง",
    runs: [
      { on: "ch9", from: 2003, to: 2010 },
      { on: "streaming", from: 2019, to: "now" },
    ],
    audience: "teens",
    reach: "phenomenon",
    unsure: ["runs"],
  }),
  inuyasha: series({
    title: "อินุยาฉะ เทพอสูรจิ้งจอกเงิน",
    runs: [{ on: "itv", from: 2003, to: 2006 }],
    audience: "teens",
    reach: "known",
    unsure: ["runs"],
  }),
  "prince-of-tennis": series({
    title: "ปริ๊นซ์ ออฟ เทนนิส",
    aside: "เจ้าชายลูกสักหลาด",
    runs: [{ on: "ch9", from: 2004, to: 2007 }],
    audience: "teens",
    reach: "known",
    unsure: ["runs"],
  }),
  "gundam-seed": series({
    title: "กันดั้ม ซี้ด",
    runs: [{ on: "ch9", from: 2004, to: 2006 }],
    audience: "teens",
    reach: "niche",
    unsure: ["runs"],
  }),
  naruto: series({
    title: "นารูโตะ นินจาจอมคาถา",
    runs: [
      { on: "ch9", from: 2005, to: 2011 },
      { on: "web", from: 2007, to: 2017 },
    ],
    audience: "teens",
    reach: "phenomenon",
    unsure: ["runs"],
  }),
  "full-metal-alchemist": series({
    title: "แขนกลคนแปรธาตุ",
    aside: "Fullmetal Alchemist",
    runs: [{ on: "ch9", from: 2005, to: 2007 }],
    audience: "teens",
    reach: "known",
    unsure: ["runs"],
  }),
  keroro: series({
    title: "เคโรโระ ขบวนการอ๊บอ๊บป่วนโลก",
    runs: [{ on: "ch9", from: 2006, to: 2010 }],
    audience: "kids",
    reach: "known",
    unsure: ["runs"],
  }),
  ueki: series({
    title: "อุเอคิ",
    aside: "The Law of Ueki เด็กที่เปลี่ยนขยะเป็นต้นไม้",
    runs: [{ on: "ch9", from: 2007, to: 2008 }],
    audience: "teens",
    reach: "known",
    unsure: ["runs", "reach"],
  }),
  bleach: series({
    title: "บลีช เทพมรณะ",
    runs: [
      { on: "cable", from: 2006, to: 2012 },
      { on: "web", from: 2006, to: 2012 },
    ],
    audience: "teens",
    reach: "known",
    unsure: ["runs"],
  }),
  "death-note": series({
    title: "เดธโน้ต",
    aside: "สมุดโน้ตกระชากวิญญาณ",
    runs: [
      { on: "web", from: 2007, to: 2012 },
      { on: "streaming", from: 2020, to: 2024 },
    ],
    audience: "teens",
    reach: "hit",
    unsure: ["runs"],
  }),
  gintama: series({
    title: "กินทามะ",
    runs: [{ on: "web", from: 2007, to: 2018 }],
    audience: "teens",
    reach: "niche",
    unsure: ["reach"],
  }),
  reborn: series({
    title: "ครูพิเศษจอมป่วน รีบอร์น!",
    runs: [{ on: "ch9", from: 2008, to: 2011 }],
    audience: "teens",
    reach: "known",
    unsure: ["runs"],
  }),
  "inazuma-eleven": series({
    title: "นักเตะแข้งสายฟ้า",
    aside: "Inazuma Eleven",
    runs: [{ on: "ch9", from: 2010, to: 2013 }],
    audience: "kids",
    reach: "known",
    unsure: ["runs"],
  }),
  "fairy-tail": series({
    title: "แฟรี่เทล ศึกจอมเวทอภินิหาร",
    runs: [{ on: "web", from: 2010, to: 2019 }],
    audience: "teens",
    reach: "known",
    unsure: ["runs"],
  }),
  "sword-art-online": series({
    title: "ซอร์ดอาร์ตออนไลน์",
    runs: [{ on: "web", from: 2012, to: 2016 }],
    audience: "teens",
    reach: "known",
  }),
  "kuroko-no-basket": series({
    title: "คุโรโกะ นายจืดพลิกสังเวียนบาส",
    runs: [{ on: "web", from: 2012, to: 2015 }],
    audience: "teens",
    reach: "known",
    unsure: ["runs"],
  }),
  "attack-on-titan": series({
    title: "ผ่าพิภพไททัน",
    aside: "Attack on Titan",
    runs: [
      { on: "web", from: 2013, to: 2023 },
      { on: "streaming", from: 2017, to: "now" },
    ],
    audience: "teens",
    reach: "hit",
    unsure: ["reach"],
  }),
  "tokyo-ghoul": series({
    title: "โตเกียวกูล",
    runs: [{ on: "web", from: 2014, to: 2018 }],
    audience: "teens",
    reach: "known",
  }),
  haikyu: series({
    title: "ไฮคิว!! คู่ตบฟ้าประทาน",
    runs: [
      { on: "web", from: 2014, to: 2020 },
      { on: "streaming", from: 2018, to: "now" },
    ],
    audience: "teens",
    reach: "known",
    unsure: ["reach"],
  }),
  "stand-by-me-doraemon": film({
    title: "โดราเอมอน เพื่อนกันตลอดไป",
    aside: "Stand by Me Doraemon ภาพสามมิติ",
    released: 2014,
    later: [{ on: "streaming", from: 2019, to: "now" }],
    audience: "general",
    reach: "hit",
    franchise: "doraemon",
    unsure: ["later"],
  }),
  "yokai-watch": series({
    title: "โยไควอช",
    runs: [{ on: "digital-tv", from: 2015, to: 2018 }],
    audience: "kids",
    reach: "known",
    unsure: ["runs", "reach"],
  }),
  "one-punch-man": series({
    title: "วันพันช์แมน",
    aside: "เทพบุตรหมัดเดียวจอด",
    runs: [
      { on: "web", from: 2015, to: 2019 },
      { on: "streaming", from: 2019, to: "now" },
    ],
    audience: "teens",
    reach: "known",
  }),
  "dragon-ball-super": series({
    title: "ดราก้อนบอล ซูเปอร์",
    runs: [
      { on: "web", from: 2015, to: 2018 },
      { on: "digital-tv", from: 2017, to: 2019 },
    ],
    audience: "kids",
    reach: "known",
    franchise: "dragon-ball",
    unsure: ["runs"],
  }),
  "your-name": film({
    title: "หลับตาฝันถึงชื่อเธอ",
    aside: "Your Name",
    released: 2016,
    later: [{ on: "streaming", from: 2019, to: "now" }],
    audience: "teens",
    reach: "hit",
  }),
  "my-hero-academia": series({
    title: "มายฮีโร่ อคาเดเมีย",
    runs: [
      { on: "web", from: 2016, to: 2019 },
      { on: "streaming", from: 2018, to: 2025 },
    ],
    audience: "teens",
    reach: "known",
  }),
} satisfies BankPart;
