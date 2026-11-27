# Spec: Haikyu!! quiz

Status: ready-for-agent

Terms follow `GLOSSARY.md`. The quiz module and screen are in `docs/documents/quiz.md`, and the data method in `docs/documents/how-to-create-quiz.md`. The Kuroko no Basket title (`.scratch/kuroko-quiz/spec.md`, `src/games/kuroko-no-basket/`) is the model. The backlog ticket is `.scratch/anime-quizzes/issues/13-haikyu.md`.

## Problem Statement

Haikyu!! fans have no quiz. The series is a finished sports manga with named schools, positions, quicks and nicknames that give clear facts with same-kind decoys.

## Solution

A new title, คุณรู้จัก Haikyu!! ดีแค่ไหน at `/haikyu`, listed under ควิซ on the home page, with at least 150 researched questions over the four tiers and glosses for the Japanese names its options and prompts use.

## User Stories

1. As a Haikyu!! fan, I want a quiz with a fan title, so that I can test how well I know the series.
2. As a fan who only watched the anime, I want the easy, medium and hard tiers to cover what the anime shows, so that I can still score well.
3. As a manga reader, I want very hard questions from the Kamomedai match and the timeskip, so that reading to chapter 402 pays off.
4. As a player, I want a school, quick or nickname option to show its Japanese and English names, so that I recognise it whichever name I know.
5. As a fan, I want a few questions on the jersey numbers the story turns on, such as Hinata's #10, so that the quiz feels like Haikyu!!.
6. As a player, I want every right answer backed by a wiki page, so that the เฉลย is trustworthy.

## Implementation Decisions

- **Module.** `src/games/haikyu/`, built like Kuroko: `questions.json`, `glossary.json`, `bands.ts`, `index.ts`, `bank.test.ts`, `boundaries.test.ts`. Route `src/app/haikyu/`, listed in `QUIZZES` in href order.
- **Scope.** The whole manga, chapters 1–402, including the Kamomedai match, the timeskip and the pro and Olympic chapters, plus the anime (four TV seasons and the *Final* film *The Dumpster Battle*) where it adapts the manga. Where the anime changes the manga, the manga wins.
- **Jersey numbers are allowed** where the story turns on them: Hinata inheriting the Little Giant's #10, a captain's #1 and similar. A number question names the number in its prompt or options, and its decoys are other numbers worn in the series. Scores, heights, stats and birthdays stay out.
- **Tiers.**

  | Tier | Who can answer |
  | --- | --- |
  | `easy` | Anyone who watched the first anime season |
  | `medium` | A fan who watched all four TV seasons |
  | `hard` | A fan who remembers match details, *The Dumpster Battle* included |
  | `very-hard` | A manga reader who finished chapter 402 |

- **Source.** Each question cites a `https://haikyuu.fandom.com/wiki/...` page, saved as plain text under `tmp/haikyu/`, and quotes it in `evidence`. Wikipedia is the second choice.
- **Bands**, as volleyball club ranks:

  | Score | Title | Line |
  | --- | --- | --- |
  | 0–4 | คนดูบนอัฒจันทร์ | ยังมองตามลูกไม่ทันเลย ลองดูการแข่งอีกสักแมตช์นะ |
  | 5–8 | ปีหนึ่งชมรมวอลเลย์ | ได้เข้าชมรมแล้ว แต่ยังต้องรับลูกตามเมนูซ้อมอีกเยอะ |
  | 9–12 | ตัวจริงคาราสุโนะ | ลงสนามได้แล้ว พร้อมกระโดดตบบอลเร็วไปกับเซ็ตเตอร์ |
  | 13–16 | เอซของทีม | ฝีมือระดับนี้ ทั้งทีมพร้อมส่งลูกสุดท้ายให้คุณตบ |
  | 17–20 | ยักษ์ใหญ่ตัวจิ๋วคนใหม่ | คุณรู้จักไฮคิวทุกซอกทุกมุม ราวกับบินข้ามกำแพงตรงหน้าไปได้แล้ว |

## Assumptions

Taken without a grilling round; veto here.

- **Out of scope.** The OVAs, the recap films, the light novels, the spin-off *Haikyu-bu!!*, the stage plays, the games, and the unreleased second part of the *Final* film.
- **Topics.** As the other titles: schools and teams, positions and roles, quicks and named plays, nicknames, matches and story events, and the jersey numbers above. No scores, heights, stats, birthdays or personal trivia.
- **Route slug** `haikyu`, title คุณรู้จัก Haikyu!! ดีแค่ไหน, keeping the `!!` of the series title.
- **Thai spellings** follow the Siam Inter Comics edition (ไฮคิว!! คู่ตบฟ้าประทาน) wherever its back-cover blurbs or printed chapter titles show the name, as found in its listings on Meb, Naiin and BookWalker (`tmp/haikyu/_siam-names.md` lists each spelling with its source). That changed คาราสุโนะ, เนโคมะ, เซโจ, โจเซ็นจิ, คาโมเมะได, สึกะวาระ, นิชิโนะยะ, เอ็นโนะชิตะ, สึกิชิมะ, ซุนะ, เค็นมะ, เอโตร์, ราชาเจ้าคอร์ต, มหาราชา, เหยื่อล่อสุดแกร่ง, GUESS.MONSTER, ศึกที่ทิ้งขยะ, บอลเร็ว and บอลเร็วประหลาด, การโจมตีแบบซิงโคร, ลิเบอโร, พินช์เสิร์ฟเวอร์, งานเก็บตัวแข่งที่โตเกียว and ศึกคัดเลือกตัวแทนจังหวัดมิยางิ. Where the edition writes a name two ways, the bank takes the more common form (เนโคมะ over เนโกมะ, เทพผู้พิทักษ์ over เทพพิทักษ์, เหยื่อล่อสุดแกร่ง over สุดยอดนกต่อ; เอซ stays though the early volumes say มือหนึ่ง). Given names inside the pages could not be read, so most given names, and every name the blurbs never show, stay house spellings.
- **Glosses** cover schools, quicks, plays and nicknames that are Japanese names or Thai translations of them, with the kanji the wiki gives. Character names need no entry. A term whose kanji the source does not give gets no gloss rather than a guessed one.
- **Size.** 150 questions (32 easy, 37 medium, 34 hard, 47 very hard) and 53 glosses, drafted from 297 pages saved in `tmp/haikyu/` in three parallel passes (Karasuno through the anime; the rival schools; the manga after the anime) and merged. Ten drafts were dropped as repeats or as ambiguous. `bun scripts/quiz-sources.ts check haikyu` finds all 150 quotes.
- **Number questions.** Two: the Little Giant's #10 (easy) and Atsumu wearing Osamu's #11 for Japan (very hard).
- **Kanji from Japanese Wikipedia.** The fandom wiki gives kanji for schools only. The kanji for nicknames, plays and tournaments (コート上の王様, 守護神, 鉄壁, 最強の囮, 大王様, 小さな巨人, 変人速攻, ゴミ捨て場の決戦, 飛べない烏, 春高, 東京遠征, 不動の昼神, ニンジャ・ショーヨー, 仙台フロッグス) come from the saved Japanese Wikipedia page. งานเก็บตัวแข่งที่โตเกียว is glossed with the arc name 東京遠征 (Tokyo Expedition), because no page gives the camp its own kanji.
- **Romaji written by hand.** No saved page gives these readings; they are Hepburn from the kanji: Chiisana Kyojin, Shugoshin, Kōto-jō no Ōsama, Saikyō no Otori, Fudō no Hirugami, Ōgiminami Kōkō, Kōto o seisu, Tsunage.
- **House spellings no Siam Inter page confirms.** Beyond the unconfirmed names in `tmp/haikyu/_names.md`, the passes added:
  - People: ชิมาดะ มาโกโตะ, ทาคิโนะอุเอะ ยูสุเกะ, อิริฮาตะ โนบุเทรุ, โออิวาเกะ ทาคุโร่, นาโออิ มานาบุ, เทชิโระ ทามาฮิโกะ, อิอิซึนะ ซึคาสะ, เอจิโกะ ซาคาเอะ, อานาบาระ ทาคาอากิ, อาคางิ มิจินาริ, วาชิโอะ ทัตสึกิ, ซารุคุอิ ยามาโตะ, ฮิรุงามิ ฟุคุโร่, เฮวะจิมะ โทชิโร่, เบ็ตโช คาซึโยชิ, เอโตร์ ซานตานา, ลูซิโอ คาโต้, นิโคลัส โรเมโร่, โฮเซ่ บลังโก, แซมสัน ฟอสเตอร์, แอรอน เมอร์ฟี่, ซูซากุ บันโจ.
  - Schools: จิโดริยามะ, อิซุมิทาเตะ, อิจิบายาชิ, ชิคุอิดะ, อินุบุชิ ฮิงาชิ, มินามิ ไดซัน.
  - Terms: เทมโปลบ (minus tempo), บันช์ชิฟต์, บล็อกเอาท์, ดีเลย์สไปก์, หมาบ้า (Mad Dog), ฮิรุงามิผู้ไม่หวั่นไหว (Immovable Hirugami), อีกาที่บินไม่ได้ (the Fallen Crows), and the banners เชื่อมต่อ, ครองสนาม, ความพยายาม, จงแข็งแกร่ง, ทุ่มสุดใจในทุกลูก, ไม่ต้องการความทรงจำ.
- **Tiers that may sit one step off.** The Tokyo representative playoff (Nekoma vs Nohebi, Yaku's injury, Lev called a sieve) is very hard, because only an out-of-scope OVA animates it; move it to hard if the OVA counts. Five very-hard questions come from the manga scenes *The Dumpster Battle* cut, listed on the film's wiki page.
- **Made-up decoys.** A few decoys are not real names but are false by the pages, such as คาราสุ as a short name for Aoba Johsai.
- **The Little Giant is ยักษ์ใหญ่ตัวจิ๋ว**, as Thai Wikipedia writes it (it also gives สมอลไจแอนท์). The top band title builds on it.

## Testing Decisions

`bun test src/games/haikyu` (shape, ids, glosses, tier counts, bands; `quizIssues` empty), then `bun run typecheck` and `bun run build`. Play one round at `/haikyu` in `bun run dev`.

## Out of Scope

New quiz features; any change to other titles' banks.
