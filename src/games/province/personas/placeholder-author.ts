import { definePersona } from "./persona";

/**
 * PLACEHOLDER. Written by the bank's author to show the format, as a typical
 * player from Chiang Mai would answer; not recorded from a real person.
 * Replace it with real players' recorded plays.
 */
export const placeholderAuthor = definePersona({
  name: "placeholder-author",
  province: "chiang-mai",
  recorded: "2026-11-25",
  placeholder: true,
  answers: {
    speak: "u",
    delicious: "lam",
    papaya: "makuaitet",
    "khanom-jeen": "khanom-sen",
    what: "ahyang",
    beautiful: "ngam-khanat",
    grandmother: "ui",
    accent: "other",
    "home-languages": "hill",
    rice: "sticky",
    pantry: "nam-pu",
    breakfast: "sticky-rice",
    "nam-phrik": "num-ong",
    noodle: "khao-soi",
    dessert: "khao-taen",
    sausage: "sai-ua",
    larb: "larb-nuea",
    "curry-scent": "northern",
    fruit: "longan",
    "temple-fair": "so",
    festival: "yi-peng",
    worship: "temple",
    cloth: "tin-jok",
    pastime: "none",
    "chinese-festivals": "some",
    sea: "sea-far",
    mountains: "mountains",
    cold: "cold",
    bangkok: "bkk-10h",
    neighbour: "MM",
  },
});
