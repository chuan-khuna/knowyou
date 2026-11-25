/**
 * Era and life questions: what watching anime was like at a stage of life.
 * Each choice's years are when it was a common answer for someone at that stage.
 */

import { choice, type BankPart } from "../schema";

export const life = {
  "primary-source": choice({
    prompt: "ตอนเรียนประถม คุณดูการ์ตูนญี่ปุ่นจากไหนบ่อยที่สุด?",
    stage: "primary",
    choices: {
      "free-tv": { label: "ฟรีทีวี ช่วงเช้าเสาร์-อาทิตย์", years: [1980, 2013] },
      video: { label: "เช่าม้วนวิดีโอหรือแผ่นวีซีดี", years: [1990, 2008], share: 0.5 },
      cable: { label: "เคเบิลทีวี เช่น Cartoon Network", years: [2000, 2016], share: 0.35 },
      youtube: { label: "ยูทูบหรือเว็บดูการ์ตูน", years: [2011, "now"] },
      streaming: { label: "Netflix หรือแอปสตรีมมิ่ง", years: [2018, "now"] },
    },
    unsure: ["share"],
  }),
  "primary-channel": choice({
    prompt: "ตอนเด็ก การ์ตูนเช้าวันหยุดที่คุณดูประจำ อยู่ช่องไหน?",
    stage: "primary",
    choices: {
      ch9: { label: "ช่อง 9", years: [1980, 2012] },
      ch3: { label: "ช่อง 3", years: [1990, 2008], share: 0.5 },
      ch7: { label: "ช่อง 7", years: [1980, 2010], share: 0.5 },
      itv: { label: "ไอทีวี", years: [1997, 2006], share: 0.35 },
      none: { label: "ไม่ได้ดูการ์ตูนทางทีวีแล้ว", years: [2014, "now"] },
    },
    unsure: ["years", "share"],
  }),
  "primary-device": choice({
    prompt: "ตอนเรียนประถม คุณดูการ์ตูนบนอะไรบ่อยที่สุด?",
    stage: "primary",
    choices: {
      "crt-tv": { label: "ทีวีจอตู้", years: [1970, 2012] },
      computer: { label: "คอมพิวเตอร์", years: [2007, 2016], share: 0.4 },
      phone: { label: "มือถือหรือแท็บเล็ต", years: [2013, "now"] },
    },
  }),
  "primary-craze": choice({
    prompt: "ตอนเรียนประถม ของเล่นอะไรฮิตที่สุดในห้องเรียนของคุณ?",
    stage: "primary",
    choices: {
      stickers: { label: "การ์ดพลังหรือสติกเกอร์ดราก้อนบอล", years: [1988, 1996] },
      tamagotchi: { label: "ทามาก็อตจิ", years: [1997, 2000] },
      beyblade: { label: "เบย์เบลดหรือการ์ดยูกิโอ", years: [2001, 2007] },
      "mobile-games": { label: "เกมบนมือถือ", years: [2012, "now"] },
    },
    unsure: ["years"],
  }),
  "secondary-games": choice({
    prompt: "ตอนเรียนมัธยม เกมที่คุณกับเพื่อนเล่นกันมากที่สุดคืออะไร?",
    stage: "secondary",
    choices: {
      famicom: { label: "แฟมิคอมหรือซูเปอร์แฟมิคอม", years: [1986, 1997] },
      playstation: { label: "เพลย์สเตชัน", years: [1997, 2008] },
      "net-cafe": { label: "เกมออนไลน์ในร้านเกม เช่น Ragnarok", years: [2002, 2012] },
      mobile: { label: "เกมมือถือ เช่น ROV", years: [2014, "now"] },
    },
    unsure: ["years"],
  }),
  "secondary-subtitles": choice({
    prompt: "ตอนเรียนมัธยม คุณดูอนิเมะแบบไหนเป็นหลัก?",
    stage: "secondary",
    choices: {
      "tv-dub": { label: "พากย์ไทยทางทีวี", years: [1980, 2010] },
      "vcd-dub": { label: "พากย์ไทยจากแผ่นวีซีดี", years: [1997, 2010], share: 0.6 },
      fansub: { label: "ซับไทยจากแฟนซับ", years: [2006, 2018] },
      licensed: { label: "ซับไทยลิขสิทธิ์ในแอป", years: [2017, "now"] },
    },
    unsure: ["years"],
  }),
  "secondary-manga": choice({
    prompt: "ตอนเรียนมัธยม คุณอ่านการ์ตูนญี่ปุ่นจากไหนเป็นหลัก?",
    stage: "secondary",
    choices: {
      rental: { label: "ร้านเช่าการ์ตูน", years: [1985, 2010] },
      magazine: { label: "นิตยสารการ์ตูนรายสัปดาห์ เช่น ซีคิดส์ หรือบูม", years: [1990, 2012], share: 0.6 },
      scanlation: { label: "เว็บอ่านการ์ตูนแปล", years: [2008, 2021] },
      app: { label: "แอปอ่านการ์ตูนลิขสิทธิ์", years: [2018, "now"] },
    },
    unsure: ["years", "share"],
  }),
  "secondary-music": choice({
    prompt: "ตอนเรียนมัธยม คุณฟังเพลงจากอะไรบ่อยที่สุด?",
    stage: "secondary",
    choices: {
      cassette: { label: "เทปคาสเซ็ตต์หรือวิทยุ", years: [1980, 1999] },
      mp3: { label: "เครื่องเล่น MP3 หรือซีดี", years: [2000, 2010] },
      youtube: { label: "ยูทูบ", years: [2010, 2018] },
      streaming: { label: "Spotify หรือ Joox", years: [2016, "now"] },
    },
    unsure: ["years"],
  }),
  "university-source": choice({
    prompt: "ช่วงอายุ 18-22 ปี คุณดูอนิเมะจากไหนเป็นหลัก?",
    stage: "university",
    choices: {
      tv: { label: "ทีวี", years: [1980, 2005] },
      discs: { label: "เช่าหรือซื้อแผ่นวีซีดีหรือดีวีดี", years: [1997, 2010] },
      download: { label: "เว็บแฟนซับหรือโหลดบิต", years: [2005, 2018] },
      apps: { label: "Netflix หรือแอปสตรีมมิ่ง", years: [2017, "now"] },
    },
    unsure: ["years"],
  }),
  "university-chat": choice({
    prompt: "ช่วงอายุ 18-22 ปี คุณคุยกับเพื่อนผ่านอะไรมากที่สุด?",
    stage: "university",
    choices: {
      pager: { label: "เพจเจอร์หรือโทรศัพท์บ้าน", years: [1985, 1999] },
      msn: { label: "MSN หรือ Hi5", years: [2001, 2010] },
      line: { label: "LINE หรือ Facebook", years: [2011, 2020] },
      "ig-tiktok": { label: "IG หรือ TikTok", years: [2018, "now"], share: 0.7 },
    },
    unsure: ["years"],
  }),
} satisfies BankPart;
