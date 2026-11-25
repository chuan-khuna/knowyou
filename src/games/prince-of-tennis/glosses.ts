/**
 * The original names shown under an option whose label is a Japanese technique
 * name, or a Thai translation of one. Keyed by the exact option label, so one
 * entry covers that label wherever it appears, as an answer or a decoy.
 */
export interface Gloss {
  /** Hepburn romanisation. */
  readonly romaji: string;
  readonly kanji: string;
  readonly english: string;
}

const g = (romaji: string, kanji: string, english: string): Gloss => ({ romaji, kanji, english });

export const GLOSSES: Readonly<Record<string, Gloss>> = {
  "สภาวะไร้ตัวตน": g("Muga no Kyōchi", "無我の境地", "State of Selflessness"),
  "ฮยาคุเร็น จิโทคุ โนะ คิวามิ": g("Hyakuren Jitoku no Kiwami", "百錬自得の極み", "Pinnacle of Hard Work"),
  "ไซกิ คัมปัตสึ โนะ คิวามิ": g("Saiki Kanpatsu no Kiwami", "才気煥発の極み", "Pinnacle of Great Wisdom"),
  "เท็นอิ มุโฮ โนะ คิวามิ": g("Ten'i Muhō no Kiwami", "天衣無縫の極み", "Pinnacle of Perfection"),
  "ฟู ริน คา ซัง": g("Fūrinkazan", "風林火山", "Wind, Forest, Fire, Mountain"),
  "นางแอ่นหวนกลับ": g("Tsubame Gaeshi", "燕返し", "Swallow Return"),
  "พิฆาตหมีสีน้ำตาล": g("Higuma Otoshi", "羆落とし", "Brown Bear Drop"),
  "ปลาวาฬเผือก": g("Hakugei", "白鯨", "White Whale"),
  "ตบแมลงเม่า": g("Kagerō Tsutsumi", "蜉蝣包み", "Mayfly Envelopment"),
  "บทเพลงแห่งหายนะ": g("Hametsu e no Rondo", "破滅への輪舞曲", "Rondo Towards Destruction"),
  "อาณาจักรน้ำแข็ง": g("Kōri no Sekai", "氷の世界", "Ice World"),
  "อาณาเขตของโออิชิ": g("Ōishi no Ryōiki", "大石の領域", "Ōishi's Territory"),
  "ฮาโดคิว": g("Hadōkyū", "波動球", "Wave-Motion Ball"),
  "อาบาเระดามะ": g("Abare Dama", "暴れ球", "Wild Ball"),
  "ไต่เชือก (สึนะวาตาริ)": g("Tsunawatari", "綱渡り", "Tightrope Walking"),
  "ซีโร่ชิกิ ดร็อปช็อต": g("Zero-Shiki Drop Shot", "零式ドロップショット", "Zero-Style Drop Shot"),
};
