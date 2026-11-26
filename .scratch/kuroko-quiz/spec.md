# Spec: Kuroko no Basket quiz

Status: ready-for-agent

Terms follow `GLOSSARY.md`. The quiz module and screen are in `docs/documents/quiz.md`. The Prince of Tennis title (`src/games/prince-of-tennis/`) is the model, and `docs/documents/prince-of-tennis-quiz-format.md` the model for the research brief.

## Problem Statement

Kuroko no Basket fans have no quiz. The user asked for one with at least 100 researched questions, built from the series wiki saved as plain text in `tmp/kuroko/`.

## Solution

A new title, คุณรู้จัก Kuroko no Basket ดีแค่ไหน at `/kuroko-no-basket`, listed under ควิซ on the home page, with at least 100 questions over the four tiers and glosses for the named moves.

## User Stories

1. As a Kuroko no Basket fan, I want a quiz with a fan title, so that I can test how well I know the series.
2. As a player, I want a named move to show its Japanese and English names, so that I recognise it whichever name I know.

## Implementation Decisions

- **Module.** `src/games/kuroko-no-basket/`, built like Prince of Tennis: `questions.json`, `glossary.json`, `bands.ts`, `index.ts`, `bank.test.ts`, `boundaries.test.ts`. Route `src/app/kuroko-no-basket/`.
- **Bands**, as basketball ranks:

  | Score | Title | Line |
  | --- | --- | --- |
  | 0–4 | คนดูข้างสนาม | ยังแยกไม่ออกเลยว่าใครคือคุโรโกะ ลองมองดี ๆ อีกครั้งนะ |
  | 5–8 | ตัวสำรองชมรมปีหนึ่ง | ได้ใส่เสื้อทีมแล้ว แต่ต้องวิ่งรอบสนามตามเมนูของริโกะอีกเยอะ |
  | 9–12 | ตัวจริงเซย์ริน | ลงสนามได้แล้ว พร้อมส่งบอลให้แสงสว่างของทีม |
  | 13–16 | ราชันไร้มงกุฎ | ฝีมือระดับนี้ ใคร ๆ ก็ยอมรับ แม้จะยังไม่ได้มงกุฎ |
  | 17–20 | รุ่นปาฏิหาริย์ | คุณรู้จักเรื่องนี้ทุกซอกทุกมุม ราวกับเป็นผู้เล่นคนที่หกผู้เป็นเงาเอง |

- **Source.** Each question cites a `https://kurokonobasuke.fandom.com/wiki/...` page and quotes it in `evidence`.

## Assumptions

Taken without a grilling round; veto here.

- **Scope.** The manga (275 chapters), the three TV seasons, and the EXTRA GAME sequel. No *Last Game* film-only changes, novels (*Replace*), games or stage plays.
- **Topics.** As Prince of Tennis: moves, schools, roles, nicknames, story events. No birthdays, heights, scores, numbers or personal trivia.
- **Route slug** `kuroko-no-basket`, title spelt "Kuroko no Basket" in the Thai title, as fans in Thailand say it.
- **Thai spellings** follow the Siam Inter Comics edition as fans use it (คุโรโกะ เท็ตสึยะ, คางามิ ไทกะ, เซย์ริน, รุ่นปาฏิหาริย์).
- **Size.** 169 questions (33 easy, 46 medium, 47 hard, 43 very hard) and 29 glosses, drafted from `tmp/kuroko/` in three parallel passes and merged; every `evidence` quote was checked against its downloaded page.
- **Thai move names and some kanji are unverified.** No Thai edition was checked for names such as ก๊อปปี้สมบูรณ์แบบ, ค้อนธอร์, ดริบเบิลสายฟ้า or ยักษา, and kanji for Perfect Copy, Formless Shot, Thor's Hammer, Mirage Shot, Lightning Dribble, Belial Eye and a few others come from memory. Swap in the names fans use.
- **No research brief doc yet.** The Prince of Tennis brief serves as the format; a Kuroko brief can follow if the bank grows by hand-off.

## Testing Decisions

`bun test src/games/kuroko-no-basket` (shape, ids, glosses, tier counts, bands), then `bun run typecheck` and `bun run build`.

## Out of Scope

New quiz features; any change to other titles' banks.
