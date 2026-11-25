/**
 * "Which of these three?" questions. Each names three title questions from
 * clearly different eras, so whichever the player picks points at an age.
 */

import { pickFrom, type BankPart } from "../schema";
import { freeTvEra } from "./free-tv-era";
import { streamingEra } from "./streaming-era";
import { webEra } from "./web-era";

const pick = pickFrom({ ...freeTvEra, ...webEra, ...streamingEra });

const MOST_OFTEN = "ถ้าดูหลายเรื่อง เลือกเรื่องที่ดูบ่อยที่สุดเรื่องเดียว";
const FIRST = "เลือกเรื่องที่ได้ดูก่อนเรื่องอื่น";
const TALKED = "เลือกเรื่องที่ถูกพูดถึงมากที่สุดเรื่องเดียว";

export const picks = {
  "pick-primary-battle": pick({
    prompt: "ตอนเรียนประถม คุณดูเรื่องไหนบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "primary",
    titles: ["dragon-ball", "pokemon", "demon-slayer"],
  }),
  "pick-primary-classic": pick({
    prompt: "ตอนเรียนประถม คุณดูเรื่องไหนบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "primary",
    titles: ["hattori", "sailor-moon", "yu-gi-oh"],
  }),
  "pick-primary-sport": pick({
    prompt: "ตอนเรียนประถม การ์ตูนเรื่องไหนที่คุณติดที่สุด?",
    aside: MOST_OFTEN,
    stage: "primary",
    titles: ["tsubasa", "digimon", "yokai-watch"],
  }),
  "pick-first-ikkyu": pick({
    prompt: "ในสามเรื่องนี้ เรื่องไหนที่คุณได้ดูเป็นเรื่องแรก?",
    aside: FIRST,
    stage: "primary",
    titles: ["ikkyu", "beyblade", "inazuma-eleven"],
  }),
  "pick-first-arale": pick({
    prompt: "ในสามเรื่องนี้ เรื่องไหนที่คุณได้ดูเป็นเรื่องแรก?",
    aside: FIRST,
    stage: "primary",
    titles: ["dr-slump", "sakura", "spy-x-family"],
  }),
  "pick-first-maruko": pick({
    prompt: "ตอนเด็ก เรื่องไหนที่คุณได้ดูก่อน?",
    aside: FIRST,
    stage: "primary",
    titles: ["chibi-maruko", "keroro", "one-punch-man"],
  }),
  "pick-class-sport": pick({
    prompt: "ตอนเรียนมัธยม เรื่องไหนที่คุณกับเพื่อนในห้องคุยกันมากที่สุด?",
    aside: TALKED,
    stage: "secondary",
    titles: ["slam-dunk", "naruto", "attack-on-titan"],
  }),
  "pick-class-dark": pick({
    prompt: "ตอนเรียนมัธยม เรื่องไหนที่คุณกับเพื่อนในห้องคุยกันมากที่สุด?",
    aside: TALKED,
    stage: "secondary",
    titles: ["yu-yu-hakusho", "death-note", "jujutsu-kaisen"],
  }),
  "pick-class-mystery": pick({
    prompt: "ตอนเรียนมัธยม เรื่องไหนที่เพื่อนในห้องคุณพูดถึงบ่อยที่สุด?",
    aside: TALKED,
    stage: "secondary",
    titles: ["kindaichi", "fairy-tail", "blue-lock"],
  }),
  "pick-secondary-most": pick({
    prompt: "ตอนเรียนมัธยม คุณดูเรื่องไหนบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "secondary",
    titles: ["ranma", "bleach", "chainsaw-man"],
  }),
  "pick-secondary-sword": pick({
    prompt: "ตอนเรียนมัธยม คุณดูเรื่องไหนบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "secondary",
    titles: ["kenshin", "sword-art-online", "frieren"],
  }),
  "pick-primary-arale": pick({
    prompt: "ตอนเรียนประถม คุณดูเรื่องไหนบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "primary",
    titles: ["dr-slump", "chibi-maruko", "yu-gi-oh"],
  }),
  "pick-primary-seiya": pick({
    prompt: "ตอนเรียนประถม การ์ตูนเรื่องไหนที่คุณติดที่สุด?",
    aside: MOST_OFTEN,
    stage: "primary",
    titles: ["saint-seiya", "digimon", "keroro"],
  }),
  "pick-first-sailor": pick({
    prompt: "ในสามเรื่องนี้ เรื่องไหนที่คุณได้ดูเป็นเรื่องแรก?",
    aside: FIRST,
    stage: "primary",
    titles: ["sailor-moon", "hamtaro", "yokai-watch"],
  }),
  "pick-class-fight": pick({
    prompt: "ตอนเรียนมัธยม เรื่องไหนที่คุณกับเพื่อนในห้องคุยกันมากที่สุด?",
    aside: TALKED,
    stage: "secondary",
    titles: ["yu-yu-hakusho", "naruto", "tokyo-ghoul"],
  }),
  "pick-secondary-detective": pick({
    prompt: "ตอนเรียนมัธยม คุณดูเรื่องไหนบ่อยที่สุด?",
    aside: MOST_OFTEN,
    stage: "secondary",
    titles: ["kindaichi", "death-note", "spy-x-family"],
  }),
} satisfies BankPart;
