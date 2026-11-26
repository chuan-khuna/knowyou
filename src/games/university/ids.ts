/**
 * The universities' stable ids. The id is what answers, personas and saved
 * plays record. Order here is the index order of every belief array.
 */
export const UNIVERSITY_IDS = [
  // กรุงเทพและปริมณฑล
  "chula",
  "thammasat",
  "mahidol",
  "kasetsart",
  "swu",
  "silpakorn",
  "kmitl",
  "kmutt",
  "kmutnb",
  "ramkhamhaeng",
  "bangkok-u",
  "assumption",
  "rangsit",
  "sripatum",
  "utcc",
  "dpu",
  "siam",
  "huachiew",
  "kasem-bundit",
  "mahanakorn",
  "tni",
  "pim",
  // ภาคเหนือ
  "cmu",
  "maejo",
  "mfu",
  "naresuan",
  "phayao",
  "payap",
  // ภาคอีสาน
  "kku",
  "msu",
  "ubu",
  "sut",
  // ภาคใต้
  "psu",
  "walailak",
  "thaksin",
  // ภาคตะวันออก
  "burapha",
] as const;

export type UniversityId = (typeof UNIVERSITY_IDS)[number];

export const UNIVERSITY_COUNT = UNIVERSITY_IDS.length;

const ID_SET: ReadonlySet<string> = new Set(UNIVERSITY_IDS);

export const isUniversityId = (value: unknown): value is UniversityId => typeof value === "string" && ID_SET.has(value);
