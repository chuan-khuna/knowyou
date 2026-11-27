# Spec: Bleach quiz

Status: ready-for-agent

Terms follow `GLOSSARY.md`. The quiz module and screen are in `docs/documents/quiz.md`, and the data method in `docs/documents/how-to-create-quiz.md`. The Kuroko no Basket title (`.scratch/kuroko-quiz/spec.md`, `src/games/kuroko-no-basket/`) is the model. The backlog ticket is `.scratch/anime-quizzes/issues/04-bleach.md`.

## Problem Statement

Bleach fans have no quiz. The series has highly structured data (zanpakutō names, shikai and bankai releases, the Gotei 13 divisions and captains) that fits the move-name glosses.

## Solution

A new title, คุณรู้จัก Bleach ดีแค่ไหน at `/bleach`, listed under ควิซ on the home page, with at least 150 researched questions over the four tiers and glosses for the Japanese names its options and prompts use.

## User Stories

1. As a Bleach fan, I want a quiz with a fan title, so that I can test how well I know the series.
2. As a fan who stopped at the 2012 anime, I want the easy and medium tiers to cover the story up to the Fullbring arc, so that I can still score well.
3. As a fan who watched Thousand-Year Blood War, I want questions about the Quincy war, so that the newest anime counts.
4. As a player, I want a zanpakutō or kidō option to show its Japanese and English names, so that I recognise it whichever name I know.
5. As a player, I want every right answer backed by a wiki page, so that the เฉลย is trustworthy.
6. As a player, I want decoys of the same kind as the answer (a bankai against bankai, a division against divisions), so that a question can't be guessed by elimination.

## Implementation Decisions

- **Module.** `src/games/bleach/`, built like Kuroko: `questions.json`, `glossary.json`, `bands.ts`, `index.ts`, `bank.test.ts`, `boundaries.test.ts`. Route `src/app/bleach/`, listed in `QUIZZES` in href order.
- **Scope.** The manga (686 chapters), the TV anime (366 episodes) and the *Thousand-Year Blood War* anime. Where the TYBW anime changes or adds to the manga, the manga wins.
- **Tiers.**

  | Tier | Who can answer |
  | --- | --- |
  | `easy` | Anyone who watched to the end of the Soul Society arc |
  | `medium` | A fan who finished the 366-episode anime |
  | `hard` | A fan who remembers fight and episode details, TYBW included |
  | `very-hard` | A close reader of the manga |

- **Source.** Each question cites a `https://bleach.fandom.com/wiki/...` page, saved as plain text under `tmp/bleach/`, and quotes it in `evidence`. Wikipedia is the second choice.
- **Bands**, as Soul Society ranks:

  | Score | Title | Line |
  | --- | --- | --- |
  | 0–4 | ดวงวิญญาณล่องลอย | ยังมองไม่เห็นยมทูตเลย ลองตั้งสมาธิแล้วมองดี ๆ อีกครั้งนะ |
  | 5–8 | นักเรียนสถาบันยมทูต | ได้ดาบมาแล้ว แต่ยังไม่ได้ยินเสียงเรียกชื่อของมันเลย |
  | 9–12 | ยมทูตผู้ปลดชิไค | ดาบของคุณตอบรับชื่อแล้ว พร้อมออกไปปราบฮอลโลว์ที่โลกมนุษย์ |
  | 13–16 | รองหัวหน้าหน่วย | ฝีมือระดับนี้ อีกก้าวเดียวก็ปลดบังไคได้แล้ว |
  | 17–20 | หัวหน้าหน่วยพิทักษ์ | คุณรู้จักบลีชทุกซอกทุกมุม ราวกับสวมฮาโอริของหัวหน้าหน่วยมาเอง |

## Assumptions

Taken without a grilling round; veto here.

- **Out of scope.** All anime filler arcs (Bount, Zanpakutō Rebellion, Gotei 13 Invasion and the rest), the films, the novels (*Can't Fear Your Own World* and the others), the games, the musicals, and the 2021 one-shot *No Breaths From Hell*.
- **Topics.** As the other titles: zanpakutō and their releases, kidō, techniques, divisions and groups, ranks and roles, places, nicknames and story events. No birthdays, heights, numbers, scores or personal trivia.
- **Route slug** `bleach`, title คุณรู้จัก Bleach ดีแค่ไหน, intro naming the span from Ichigo meeting Rukia to the Thousand-Year Blood War.
- **Thai spellings** follow the Siam Inter Comics edition (บลีช เทพมรณะ) as fans use it, such as คุโรซากิ อิจิโกะ, คุจิกิ รูเคีย, ยมทูต, ชิไค and บังไค. No Thai edition was checked; names are flagged below as the bank lists them.
- **Size.** 203 questions (42 easy, 61 medium, 57 hard, 43 very hard) and 176 glosses, drafted from 340 pages saved in `tmp/bleach/` in three parallel passes (story; Shinigami powers and Soul Society; Hollows, Arrancar, Quincy and Fullbring) and merged; `bun scripts/quiz-sources.ts check bleach` finds all 203 quotes.
- **Glosses** cover zanpakutō, shikai and bankai names, kidō, techniques, groups and ranks that are Japanese names or Thai translations of them, and the Spanish and German terms (ควินซี่, โซนีโด, เรซูเรคซิออน, ซิลเบิร์น, วาห์ร์เวลท์ and others) with the kanji the wiki gives them. Character names need no entry. Every kanji is on a saved page, but that proves it is on the wiki, not that it belongs to that label. Fullbring kanji keep the katakana reading the page writes, such as `完現術 (フルブリング)`.
- **Release commands are translated.** Shinigami and Arrancar commands both read as Thai imperatives: จงกระจาย, จงคำราม, จงร่ายรำ, จงตื่น, จงปิดล้อม, จงบดขยี้, จงภาวนา, จงกลืนกิน and the rest. Swap in the edition's wording if fans know it.
- **Thai names are house spellings.** No Thai edition was checked for any of these:
  - Ranks, groups and places: ผู้บัญชาการใหญ่, หน่วยพิทักษ์ 13 หน่วย, หน่วยที่ N, สภา 46 ห้อง, สถาบันวิจัยและพัฒนาเทคโนโลยี, หน่วยศูนย์, หน่วยลับ (ออนมิตสึคิโด), สมาคมยมทูตหญิง, สถาบันชินโอ, หอสำนึกผิด (เซ็นไซคิว), คุกใต้ดินใหญ่กลาง, เนินโซเคียวคุ, วังราชาวิญญาณ.
  - Translated titles and abilities: เทพธิดาแห่งความเร็ว, เทพแห่งดาบ, ราชาแห่งธัญพืช, โลกกลับด้าน, สะกดจิตสมบูรณ์, โลกแห่งอวิชชา.
  - Transliterated techniques, kidō, Resurrección, Quincy and Fullbring names, such as เนจิบานะ, เก็ตสึกะ จูจิโช, โกริวเท็นเม็ตสึ, เซ็นจู โคเท็น ไทโฮ, เทรส เบสเตียส, มูร์ซีเอลาโก, ลิคท์ เรเกน, ซันเรย์ โกลฟ and บุ๊ค ออฟ ดิ เอนด์.
- **Left out on purpose.** Unohana's bankai (it clashes with the question on the first Kenpachi) and Senjumaru making the shihakushō (it comes only from a novel). Seele Schneider has no gloss, because its English name would answer the question it appears in.
- **One tier may be off.** `ukitake-gives-badge` is medium, though it happens at the end of the Soul Society arc and could be easy.

## Testing Decisions

`bun test src/games/bleach` (shape, ids, glosses, tier counts, bands; `quizIssues` empty), then `bun run typecheck` and `bun run build`. Play one round at `/bleach` in `bun run dev`.

## Out of Scope

New quiz features; any change to other titles' banks.
