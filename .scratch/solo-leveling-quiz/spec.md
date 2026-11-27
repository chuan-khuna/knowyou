# Spec: Solo Leveling quiz

Status: ready-for-agent

Terms follow `GLOSSARY.md`. The quiz module and screen are in `docs/documents/quiz.md`, and the data method in `docs/documents/how-to-create-quiz.md`. The Kuroko no Basket title (`.scratch/kuroko-quiz/spec.md`, `src/games/kuroko-no-basket/`) is the model. The backlog ticket is `.scratch/anime-quizzes/issues/11-solo-leveling.md`.

## Problem Statement

Solo Leveling fans have no quiz. It is the first Korean title, and a gloss today must carry romaji and kanji, which a Korean name does not have.

## Solution

A new title, คุณรู้จัก Solo Leveling ดีแค่ไหน at `/solo-leveling`, listed under ควิซ on the home page, with at least 150 researched questions over the four tiers. A gloss may now be Korean: hangul, its romanization and the English name.

## User Stories

1. As a Solo Leveling fan, I want a quiz with a fan title, so that I can test how well I know the series.
2. As a fan who only watched the anime, I want the easy and medium tiers to cover what the anime shows, so that I can still score well.
3. As a webtoon reader, I want very hard questions from the end of the main story, so that reading to chapter 179 pays off.
4. As a player, I want a skill or title option to show its Korean and English names, so that I recognise it whichever name I know.
5. As a player of the Japanese titles, I want their glosses to look exactly as before, so that nothing I know changes.
6. As a player, I want every right answer backed by a wiki page, so that the เฉลย is trustworthy.

## Implementation Decisions

- **Korean glosses.** A gloss is one of two shapes, told apart by its fields. The parser accepts an entry with `english` and exactly one complete pair, and reports any other entry. Existing glossaries stay as they are.

  ```ts
  interface JapaneseGloss { aka?: readonly string[]; romaji: string; kanji: string; english: string }
  interface KoreanGloss   { aka?: readonly string[]; romanization: string; hangul: string; english: string }
  type Gloss = JapaneseGloss | KoreanGloss;
  ```

  `romanization` is Revised Romanization of Korean. The screen's first gloss line shows `romanization, 한글` with `lang="ko-Latn"` and `lang="ko"`, where a Japanese gloss shows `Romaji, 漢字` with `ja-Latn` and `ja`. The second line, the English name, is the same for both.
- **Module.** `src/games/solo-leveling/`, built like Kuroko: `questions.json`, `glossary.json`, `bands.ts`, `index.ts`, `bank.test.ts`, `boundaries.test.ts`. Route `src/app/solo-leveling/`, listed in `QUIZZES` in href order.
- **Scope.** The main story only: the webtoon chapters 1–179, and the anime seasons where they adapt it.
- **Tiers.**

  | Tier | Who can answer |
  | --- | --- |
  | `easy` | Anyone who watched the first anime season |
  | `medium` | A fan who watched every anime episode |
  | `hard` | A fan who remembers dungeon and raid details |
  | `very-hard` | A webtoon reader who finished the main story |

- **Source.** Each question cites a `https://solo-leveling.fandom.com/wiki/...` page, saved as plain text under `tmp/solo-leveling/`, and quotes it in `evidence`. Wikipedia is the second choice.
- **Bands**, as hunter ranks:

  | Score | Title | Line |
  | --- | --- | --- |
  | 0–4 | ฮันเตอร์แรงก์ E | ยังเป็นฮันเตอร์ที่อ่อนแอที่สุดอยู่เลย ลองกลับเข้าดันเจี้ยนอีกสักรอบนะ |
  | 5–8 | ฮันเตอร์แรงก์ C | ผ่านดันเจี้ยนระดับต่ำมาได้ แต่เควสต์รายวันยังรอคุณอยู่ทุกเช้า |
  | 9–12 | ฮันเตอร์แรงก์ A | ฝีมือระดับนี้ กิลด์ใหญ่คงอยากชวนเข้าทีมบุกแล้ว |
  | 13–16 | ฮันเตอร์แรงก์ S | คุณอยู่ระดับสูงสุดของสมาคมฮันเตอร์ พร้อมรับมือประตูทุกสีแล้ว |
  | 17–20 | ราชาแห่งเงา | คุณรู้จักเรื่องนี้ทุกซอกทุกมุม จนกองทัพเงาพร้อมลุกขึ้นเดินตามคุณ |

## Assumptions

Taken without a grilling round; veto here.

- **Out of scope.** The side stories (chapters 180 onward), *Solo Leveling: Ragnarok*, the games (*ARISE* and others), the film recaps' new scenes, and details found only in the web novel.
- **Topics.** As the other titles: skills, titles and classes, guilds, ranks, dungeons and gates, shadows, monarchs and rulers, places, nicknames and story events. No birthdays, heights, stats, levels, numbers or personal trivia.
- **Route slug** `solo-leveling`, title คุณรู้จัก Solo Leveling ดีแค่ไหน.
- **Names.** Characters keep their Korean names, as the webtoon and the anime both do (ซองจินอู, ยูจินโฮ, ชาแฮอิน). Thai spellings follow the Thai webtoon and subtitles as fans use them; no Thai edition was checked, so each spelling is a guess to correct.
- **Size.** At least 150 questions, at least 30 in each tier, drafted from `tmp/solo-leveling/` in parallel passes and merged; every `evidence` quote checked against its saved page.
- **Glosses** use the Korean shape for skills, titles, classes and groups whose Korean name the source gives. A term whose hangul the source does not give gets no gloss rather than a guessed one.
- **Thai spellings checked.** These match Thai Wikipedia's โซโลเลเวลลิง page: ซองจินอู, ยูจินโฮ, ชาแฮอิน, โกกอนฮี, อูจินชอล, ชเวจงอิน, แบคยุนโฮ, ลิมแทกยู, มาดงอุก, มินบยองกยู, อีจูฮี, ซงชียูล, คังแทชิก, ฮวังดงซอก, ฮวังดงซู, ฮันซองอี, อีมินซอง, โทมัส อังเดร, หลิว จื้อกัง, คริสโตเฟอร์ รีด, สิทธารถ พัจจัน, โกโตะ ริวจิ, เลนนาร์ท เนียร์มันน์, แอชบอร์น, อิกริส, ไอรอน, แทงค์, ทัสก์, เบรู, เบลเลียน, ไคเซล, บารัน, บารูก้า, คาร์กัลกัน, ราชามด, ราชาแห่งเงา, ผู้ปกครอง, ฮันเตอร์ระดับชาติ, ฮีลเลอร์, กิลด์เสือขาว, กิลด์ปีศาจ, กิลด์เกียรติยศ, ดันเจี้ยน, ดันเจี้ยนคู่, ประตูแดง, เกาะเชจู, สกัดเงา. Korean names are written without a space (Thai Wikipedia mixes both).
- **Thai spellings guessed.** No page backs these; correct any that fans spell otherwise.
  - People: ซองจินอา, ซองอิลฮวาน, ยูมยองฮัน, ยูซูฮยอน, อีอึนซอก, คิมซังชิก, คิมชอล, พัคฮีจิน, พัคจงซู, อันซังมิน, คังจองโฮ, ซนกีฮุน, แบยุนซอก, อีวองยู, อีโบรา, จีนา, ฮันเซมิ, โจนัส, อดัม ไวท์, นอร์มา เซลเนอร์, ยูริ ออร์ลอฟ, and the Japanese hunters, family name first: ซูกิโมโตะ เรจิ, มัตสึโมโตะ ชิเงโอะ, คุมาโมโตะ อัตสึชิ, ทาวาตะ คานาเอะ, โฮชิโนะ มิโนรุ, ทานากะ เคนโซ, อิชิดะ มาริ, ชิมิสึ อาคาริ.
  - Shadows, bosses, monarchs: กรีด, จีมา, คามิช, คาซาก้า, เซอร์เบอรัส, วัลแคน, เมทัส, เอซิล ราดิรู, คันดิอารู, สถาปนิก, ราชินีมด, บอสนาคา, หมีน้ำแข็งจ่าฝูง, แมงมุมยักษ์บูริวรา, ตะขาบยักษ์เขี้ยวพิษ, หมาจิ้งจอกดันเจี้ยน, ไฮออร์ค, เอลฟ์น้ำแข็ง, รูปปั้นเทพเจ้า, แอนทาเรส, ราคาน, ซิลลาด, ทาร์นัก, เลเกีย, เควเรชา, โยกุมุนท์, เหล่าราชา, ผู้สัมบูรณ์, and the monarch titles (ราชาแห่งน้ำแข็ง, ราชาแห่งปฐมกาล, ราชามังกร, ราชาปีศาจ).
  - Skills and titles: สลับเงา, เก็บรักษาเงา, อาณาเขตของราชา, อำนาจผู้ปกครอง, มือผู้ปกครอง, ความกลัวมังกร, ล่องหน, กระหายเลือด, เจตนาสังหาร, ควิกซิลเวอร์, ฟันจุดตาย, คริติคอลแอทแท็ก, แดกเกอร์รัช, ทรหด, เจตจำนงฟื้นฟู, ล้างพิษ, เทคนิคกริชขั้นสูง, ตะกละ, เสียงยั่วยุ, สำแดงร่างวิญญาณ, นักฆ่าหมาป่า, นักล่าปีศาจ, เนโครแมนเซอร์, and the classes แอสแซสซิน, ไฟเตอร์, เมจ, เรนเจอร์, แทงเกอร์.
  - Guilds, groups and the System: กิลด์อาจิน, กิลด์ฮันเตอร์ส, กิลด์อัศวิน, กิลด์สกาเวนเจอร์, กิลด์ชักดาบ, สมาคมฮันเตอร์เกาหลี, สมาคมฮันเตอร์ญี่ปุ่น, สำนักงานฮันเตอร์กลาง, ยูจินคอนสตรักชัน, ทีมจู่โจม, ทีมตรวจการ, ฟอลส์แรงเกอร์, ระบบ, ผู้เล่น, ร้านค้า, โกลด์, เควสต์รายวัน, เควสต์เปลี่ยนอาชีพ, เขตลงโทษ, ความกล้าของผู้อ่อนแอ, สังหารศัตรู, เอาชีวิตรอด, การเตรียมตัวเพื่อเป็นผู้แข็งแกร่ง, กล่องสุ่มต้องสาป.
  - Items and places: กริชของราชาปีศาจ, ดาบยาวของราชาปีศาจ, เขี้ยวพิษของคาซาก้า, นักฆ่าอัศวิน, กริชของบารูก้า, ความพิโรธของคามิช, ลูกแก้วแห่งความละโมบ, หัวใจสีดำ, น้ำศักดิ์สิทธิ์แห่งชีวิต, ถ้วยแห่งการเวียนว่าย, ยาอายุวัฒนะ, หินรูน, หินแก่นเวท, ผลึกมานา, หินเคลื่อนย้ายทันที, โรคนิทราชั่วนิรันดร์, วิหารคาร์เทนอน, ปราสาทปีศาจ, ดันเจี้ยนชั่วคราว, ดันเจี้ยนเบรก, ดันเจี้ยนแมลง, ดันเจี้ยนก็อบลิน, สถานีรถไฟใต้ดินฮับจอง, รอยแยกมิติ, ประตู, ประตูแรงก์ S โตเกียว, ประตูแรงก์ S เกาะเชจู.
  - Nickname: นักเต้น (Cha Hae-In's "Dancer").
- **Gates are ประตู**, as in the score bands. Thai Wikipedia also uses the English loan เกท.
- **Tiers that may sit one step off.** `joohee-busan-defense` (hard): no episode page mentions Busan. `knights-no-s-rank` (hard): the Knights Guild appears from episode 21, but no page shows the anime saying it has no S-Ranks. `sugimoto-new-master` (very hard): he appears in episode 25, but the page cites the webtoon for his promotion.

## Testing Decisions

- `bun test src/games/quiz` covers the Korean shape at the parser: a Korean entry parses, a mixed or half entry is reported, and every shipped Japanese glossary still parses.
- `bun test src/games/solo-leveling` (shape, ids, glosses, tier counts, bands; `quizIssues` empty), then `bun run typecheck` and `bun run build`. Play one round at `/solo-leveling` in `bun run dev` and see a Korean gloss render.

## Out of Scope

New quiz features beyond the Korean gloss; any change to other titles' banks.
