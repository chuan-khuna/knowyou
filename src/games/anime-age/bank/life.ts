/**
 * Era and life questions: what watching anime was like at a stage of life.
 * Each choice's years are when it was a common answer for someone at that stage.
 * Every question asks for the single most frequent thing, so each person has
 * exactly one fitting choice.
 */

import { choice, type BankPart } from "../schema";

const MOST_OFTEN = "ถ้ามีหลายอย่าง เลือกอันที่บ่อยที่สุดข้อเดียว";

export const life = {
  "primary-source": choice({
    prompt: "ตอนเรียนประถม คุณดูการ์ตูนญี่ปุ่นจากไหนบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "primary",
    choices: {
      tv: { label: "ทีวี", hint: "ฟรีทีวีหรือเคเบิล", years: [1980, 2013] },
      video: { label: "ม้วนวิดีโอหรือแผ่น", hint: "เช่าหรือซื้อวิดีโอ วีซีดี ดีวีดี", years: [1990, 2008], share: 0.5 },
      youtube: { label: "ยูทูบหรือเว็บดูการ์ตูน", years: [2011, "now"] },
      streaming: { label: "แอปสตรีมมิ่ง", hint: "เช่น Netflix หรือ Bilibili", years: [2018, "now"] },
    },
    unsure: ["share"],
  }),
  "primary-channel": choice({
    prompt: "ตอนเรียนประถม การ์ตูนเช้าวันหยุดที่คุณดูบ่อยที่สุดอยู่ช่องไหน?",
    aside: MOST_OFTEN,
    stage: "primary",
    choices: {
      ch9: { label: "ช่อง 9", years: [1980, 2012] },
      ch3: { label: "ช่อง 3", years: [1990, 2008], share: 0.5 },
      ch7: { label: "ช่อง 7", years: [1980, 2010], share: 0.5 },
      "not-tv": { label: "ไม่ได้ดูการ์ตูนทางทีวี", hint: "ดูจากยูทูบหรือแอปเป็นหลัก", years: [2014, "now"] },
    },
    unsure: ["years", "share"],
  }),
  "primary-device": choice({
    prompt: "ตอนเรียนประถม คุณดูการ์ตูนบนอะไรบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "primary",
    choices: {
      tv: { label: "ทีวี", years: [1970, 2014] },
      computer: { label: "คอมพิวเตอร์", years: [2007, 2016], share: 0.4 },
      phone: { label: "มือถือหรือแท็บเล็ต", years: [2013, "now"] },
    },
  }),
  "primary-craze": choice({
    prompt: "ตอนเรียนประถม ของเล่นอะไรฮิตที่สุดในห้องเรียนของคุณ?",
    aside: "เลือกอันที่ฮิตที่สุดข้อเดียว",
    stage: "primary",
    choices: {
      stickers: { label: "การ์ดพลังหรือสติกเกอร์การ์ตูน", years: [1985, 1996] },
      tamagotchi: { label: "ทามาก็อตจิ", years: [1997, 2000] },
      beyblade: { label: "เบย์เบลดหรือการ์ดยูกิโอ", years: [2001, 2009] },
      "mobile-games": { label: "เกมบนมือถือหรือแท็บเล็ต", years: [2010, "now"] },
    },
    unsure: ["years"],
  }),
  "secondary-games": choice({
    prompt: "ตอนเรียนมัธยม เกมที่คุณกับเพื่อนเล่นกันมากที่สุดคืออะไร?",
    aside: MOST_OFTEN,
    stage: "secondary",
    choices: {
      famicom: { label: "แฟมิคอมหรือซูเปอร์แฟมิคอม", years: [1986, 1997] },
      playstation: { label: "เพลย์สเตชัน", years: [1997, 2008] },
      "net-cafe": { label: "เกมออนไลน์ในร้านเกม", hint: "เช่น Ragnarok หรือ Audition", years: [2002, 2012] },
      mobile: { label: "เกมมือถือ", hint: "เช่น ROV หรือ Free Fire", years: [2013, "now"] },
    },
    unsure: ["years"],
  }),
  "secondary-subtitles": choice({
    prompt: "ตอนเรียนมัธยม คุณดูอนิเมะแบบไหนบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "secondary",
    choices: {
      dubbed: { label: "พากย์ไทย", hint: "ทางทีวีหรือแผ่นวีซีดี", years: [1980, 2012] },
      fansub: { label: "ซับไทยจากแฟนซับ", years: [2006, 2018] },
      licensed: { label: "ซับไทยลิขสิทธิ์ในแอป", years: [2017, "now"] },
      "did-not-watch": { label: "ไม่ได้ดูอนิเมะช่วงนั้น", years: [1960, "now"], share: 0.5 },
    },
    unsure: ["years", "share"],
  }),
  "secondary-manga": choice({
    prompt: "ตอนเรียนมัธยม คุณอ่านการ์ตูนญี่ปุ่นจากไหนบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "secondary",
    choices: {
      print: { label: "เล่มกระดาษ", hint: "ร้านเช่าการ์ตูน แผงหนังสือ หรือนิตยสารรายสัปดาห์", years: [1985, 2012] },
      scanlation: { label: "เว็บอ่านการ์ตูนแปล", years: [2008, 2021] },
      app: { label: "แอปอ่านการ์ตูนลิขสิทธิ์", years: [2018, "now"] },
      "did-not-read": { label: "ไม่ได้อ่านการ์ตูนช่วงนั้น", years: [1960, "now"], share: 0.5 },
    },
    unsure: ["years", "share"],
  }),
  "secondary-music": choice({
    prompt: "ตอนเรียนมัธยม คุณฟังเพลงจากอะไรบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "secondary",
    choices: {
      cassette: { label: "เทปคาสเซ็ตต์หรือวิทยุ", years: [1980, 1999] },
      mp3: { label: "ซีดีหรือเครื่องเล่น MP3", years: [2000, 2010] },
      youtube: { label: "ยูทูบ", years: [2010, 2018] },
      streaming: { label: "แอปเพลง", hint: "เช่น Spotify หรือ Joox", years: [2016, "now"] },
    },
    unsure: ["years"],
  }),
  "university-source": choice({
    prompt: "ช่วงอายุ 18-22 ปี คุณดูอนิเมะจากไหนบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "university",
    choices: {
      "tv-or-discs": { label: "ทีวีหรือแผ่น", hint: "ทางทีวี หรือเช่าซื้อวีซีดีและดีวีดี", years: [1980, 2010] },
      download: { label: "เว็บแฟนซับหรือโหลดบิต", years: [2005, 2018] },
      apps: { label: "แอปสตรีมมิ่ง", hint: "เช่น Netflix หรือ Bilibili", years: [2017, "now"] },
      "did-not-watch": { label: "ไม่ได้ดูอนิเมะช่วงนั้น", years: [1960, "now"], share: 0.7 },
    },
    unsure: ["years", "share"],
  }),
  "university-chat": choice({
    prompt: "ช่วงอายุ 18-22 ปี คุณคุยกับเพื่อนผ่านอะไรบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "university",
    choices: {
      phone: { label: "โทรศัพท์บ้านหรือเพจเจอร์", years: [1985, 2000] },
      msn: { label: "MSN หรือ Hi5", years: [2001, 2010] },
      line: { label: "LINE หรือ Facebook", years: [2011, 2020] },
      "ig-tiktok": { label: "IG หรือ TikTok", years: [2019, "now"], share: 0.7 },
    },
    unsure: ["years"],
  }),
} satisfies BankPart;
