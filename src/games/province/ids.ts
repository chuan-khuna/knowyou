/**
 * The 77 provinces' stable ids and their ISO 3166-2 codes. The id is what
 * answers, personas and saved plays record; the ISO code joins a province to
 * its map shape. Order here is the index order of every belief array.
 */
export const PROVINCE_ISO = {
  // ภาคเหนือ
  "chiang-mai": "TH-50",
  "chiang-rai": "TH-57",
  lampang: "TH-52",
  lamphun: "TH-51",
  "mae-hong-son": "TH-58",
  nan: "TH-55",
  phayao: "TH-56",
  phrae: "TH-54",
  uttaradit: "TH-53",
  // ภาคตะวันออกเฉียงเหนือ
  kalasin: "TH-46",
  "khon-kaen": "TH-40",
  chaiyaphum: "TH-36",
  "nakhon-phanom": "TH-48",
  "nakhon-ratchasima": "TH-30",
  "bueng-kan": "TH-38",
  buriram: "TH-31",
  "maha-sarakham": "TH-44",
  mukdahan: "TH-49",
  yasothon: "TH-35",
  "roi-et": "TH-45",
  loei: "TH-42",
  sisaket: "TH-33",
  "sakon-nakhon": "TH-47",
  surin: "TH-32",
  "nong-khai": "TH-43",
  "nong-bua-lamphu": "TH-39",
  "amnat-charoen": "TH-37",
  "udon-thani": "TH-41",
  "ubon-ratchathani": "TH-34",
  // ภาคกลาง
  bangkok: "TH-10",
  "kamphaeng-phet": "TH-62",
  "chai-nat": "TH-18",
  "nakhon-nayok": "TH-26",
  "nakhon-pathom": "TH-73",
  "nakhon-sawan": "TH-60",
  nonthaburi: "TH-12",
  "pathum-thani": "TH-13",
  ayutthaya: "TH-14",
  phichit: "TH-66",
  phitsanulok: "TH-65",
  phetchabun: "TH-67",
  lopburi: "TH-16",
  "samut-prakan": "TH-11",
  "samut-songkhram": "TH-75",
  "samut-sakhon": "TH-74",
  "sing-buri": "TH-17",
  sukhothai: "TH-64",
  "suphan-buri": "TH-72",
  saraburi: "TH-19",
  "ang-thong": "TH-15",
  "uthai-thani": "TH-61",
  // ภาคตะวันออก
  chanthaburi: "TH-22",
  chachoengsao: "TH-24",
  "chon-buri": "TH-20",
  trat: "TH-23",
  "prachin-buri": "TH-25",
  rayong: "TH-21",
  "sa-kaeo": "TH-27",
  // ภาคตะวันตก
  kanchanaburi: "TH-71",
  tak: "TH-63",
  "prachuap-khiri-khan": "TH-77",
  phetchaburi: "TH-76",
  ratchaburi: "TH-70",
  // ภาคใต้
  krabi: "TH-81",
  chumphon: "TH-86",
  trang: "TH-92",
  "nakhon-si-thammarat": "TH-80",
  narathiwat: "TH-96",
  pattani: "TH-94",
  "phang-nga": "TH-82",
  phatthalung: "TH-93",
  phuket: "TH-83",
  yala: "TH-95",
  ranong: "TH-85",
  songkhla: "TH-90",
  satun: "TH-91",
  "surat-thani": "TH-84",
} as const;

export type ProvinceId = keyof typeof PROVINCE_ISO;

export const PROVINCE_IDS = Object.keys(PROVINCE_ISO) as readonly ProvinceId[];
export const PROVINCE_COUNT = PROVINCE_IDS.length;

export const isProvinceId = (value: unknown): value is ProvinceId =>
  typeof value === "string" && Object.hasOwn(PROVINCE_ISO, value);
