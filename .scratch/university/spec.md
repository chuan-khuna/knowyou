# Spec: University game v1

Status: ready-for-agent

Terms follow `GLOSSARY.md`. The foundation is `.scratch/foundation/spec.md`. Province is the precedent for every shape not stated here: `.scratch/province/spec.md`, `docs/documents/province-engine.md` and `src/games/province/`.

## Problem Statement

The home page lists ทายมหาวิทยาลัย as "เร็ว ๆ นี้", the one game of the three that players can't play yet. Thai players want a game that guesses which university they went to from what only its students know: how freshmen were welcomed, how people got around campus, where they ate, which events the whole campus waited for. A game that asks "what colour is your university?" would feel like a quiz about the university, not a game that reads you.

## Solution

A playable game at `/university`, on the shared play screen. It asks about campus life one question at a time, with the confidence meter and no live view, then makes one guess: "คุณเรียนที่<ชื่อมหาวิทยาลัย>". The player says whether it's right. If it's wrong, they pick their real university from a list grouped by area, or say it isn't in the list. The result screen shows the guess, the true university when given, the top 3 candidates, the 2 answers that pointed hardest at the guess, and the answers list. The home page lists University as playable.

## User Stories

1. As a player, I want to start ทายมหาวิทยาลัย from the home page, so that I can play it like Province.
2. As a player, I want questions about campus life (รับน้อง, getting to class, where I ate, campus events), so that the game reads what only a student there would know.
3. As a player, I want only a few questions that point straight at a university (its area, its setting, public or private), so that it doesn't feel like a quiz about the university.
4. As a player, I want a question about my faculty's field, so that the game can use what my university is strong in.
5. As a player, I want every question to have "ไม่แน่ใจ" as the last option, so that I'm never forced to guess.
6. As a player, I want 4–6 options per question, each with one clear meaning, so that I can answer quickly.
7. As a player, I want some questions to name a few likely universities' traditions, places or foods, so that the game can tell close universities apart.
8. As a player, I want the game to stop once it is confident, or after a fixed maximum, so that a play doesn't drag on.
9. As a player, I want exactly one guess, so that the reveal feels like a bet.
10. As a player, I want to say whether the guess was right, so that I can react to the reveal.
11. As a player whose guess was wrong, I want to pick my real university from a list grouped by area, so that I can see how close the game got.
12. As a player whose university isn't one of the game's, I want to say so at the reveal, so that I'm not forced to pick a wrong one.
13. As a player, I want to see the top 3 candidates with their chances, so that I see who the game was torn between.
14. As a player, I want to see the answers that pointed hardest at the guess, so that I understand why it guessed that university.
15. As a player, I want to see my answers list and play again, so that I can review and retry.
16. As a player who studied at more than one university, I want the game to ask about the one where I did my bachelor's, so that each question has one answer.
17. As a player whose university has several campuses, I want questions that fit the campus I studied at, so that a branch campus doesn't mislead the game.
18. As a question author, I want to write questions as facts about universities (area, public or private, field mix, campus setting, tags), not as 38-row tables, so that the bank is reviewable.
19. As a maintainer, I want simulated-player and persona suites like Province's, so that I know the engine and the bank work.
20. As a maintainer, I want the university engine to implement the shared engine contract with no live data, so that the play screen and back button work unchanged.
21. As a player, I want a play in progress to survive a page refresh, so that a reload doesn't throw away my answers. This uses the shared restore that Province gets.
22. As a player, I want the same UI sounds and mute toggle as the other games.

## Implementation Decisions

- **Engine per game.** `src/games/university/` owns its engine, facts, bank and tests behind one `index.ts`, with a boundaries test like Province's. It implements the shared `Engine<V, X>` contract unchanged and with no live type. Its play is an immutable value whose only state is the seed and the answer log. It copies Province's belief, question choice, pick and pointer logic, as Province copied Anime Age's (foundation Q7).
- **Hidden value.** One of 38 universities (see Assumptions). The prior is uniform. The guess is the top university, confidence is its belief, and a hit is the exact university.
- **University facts.** One typed table keyed by a stable id. Each university records:
  - its full Thai name and the short name players use (จุฬาฯ, มธ., มช.)
  - its area: กรุงเทพและปริมณฑล, ภาคเหนือ, ภาคอีสาน, ภาคใต้ or ภาคตะวันออก
  - public or private
  - a field mix: the share of undergraduates in each field group (health, science and engineering, business, arts and communication, social sciences and education), summing to 1
  - a campus setting mix over downtown, suburb, provincial town and countryside, summing to 1, so a university with several campuses spreads across them
  - tags for traits that cut across area and type, such as a strict รับน้อง, ฟุตบอลประเพณี, a free campus shuttle, a rail line at the gate, first years in campus dorms, a farm on campus, English as the teaching language
  - at least two signatures
  - the facts the author doubts, in `unsure`
- **Question facts.** Every question is a lean. Each option leans toward areas, public or private, field groups, settings or tags, with a `base` and tag boosts, by Province's lean formula. An `override` covers odd cases. There is no geography kind.
- **Question mix** (the user's direction: campus life first).
  - Campus life and traditions, about 15 or more: รับน้อง and ห้องเชียร์, getting to campus, getting around campus, where you ate lunch, where you read before exams, the uniform, the big campus event, what's in the middle of campus, how far campus is from the night market.
  - Study, about 4: your field group, the teaching language, how you got in, where your classmates came from.
  - Place, at most 5, capped by a bank check: the area, the campus setting, public or private through the fees.
- **Pick questions.** Built in play from the front-runners' signatures. A signature is a tradition, a campus place, a food or a song a student recognises as their university's own. Prompt: "อันไหนคุ้นที่สุดสำหรับมหาวิทยาลัยของคุณ?". Options: 3–4 signatures, then "ไม่มีอันไหนเลย", then "ไม่แน่ใจ". The owner picks their own signature. Students of another university in the same area know it more often than those further away, which replaces Province's distance falloff. The question id names its owners and signatures, so the seed and the answer log alone rebuild it. The cap per play and the gap rule start at Province's values.
- **Selection and stop.** Expected information gain with a seeded shortlist, as in Province. Every number lives in one `UNIVERSITY_RULES` constant. Start at Province's values and tune against the simulated suite.
- **Result screen.**
  - The guess on the gold sheet.
  - The reveal: right, or wrong with an area-grouped university picker that ends with "ไม่มีในรายการ".
  - The top 3 candidates with their chances.
  - The 2 answers that pointed hardest at the guess.
  - The answers list, play again, and the dev-only persona copy button, shown only once a listed university is confirmed.
- **Shared code.** The saved play learns the University game id. Nothing else in the shared play screen changes.
- **Home page and README.** University becomes playable, with a blurb about campus life.
- **UI.** The shared play screen, Hallmark tokens and classes, no emoji icons, Thai text only.

## Testing Decisions

- **One seam.** The university engine's public interface, exactly as the play screen uses it.
- **Bank validity.**
  - 38 universities with unique ids, unique names and unique short names.
  - Field mixes and setting mixes sum to 1.
  - Every derived row is a valid distribution with every entry above 0.
  - 4–6 options per question, with "ไม่แน่ใจ" last and unique labels.
  - Place questions number 5 or fewer.
  - Every university has at least 2 signatures, and no two universities share one.
  - Every tag a university carries is read by some question.
- **Simulated players.** For each university, seeded plays sampled from the derived rows, reporting the exact hit rate, the top-3 rate, the right-area rate, the worst university and mean questions asked. Measure a baseline first, then set the asserted thresholds from it with a written justification. Never loosen them later to make a change pass.
- **Personas.** The same infrastructure as Province, with one placeholder persona clearly marked as a placeholder.
- **Contract behaviour.** Reproducibility, immutability, numbering, rejection of an unknown key, a saved play that restores exactly with pick questions in it, and stopping when the bank runs out.

## Out of Scope

- Rajabhat and Rajamangala universities, distance-learning universities (มสธ.) and graduate-only institutes (NIDA). Their players answer "ไม่มีในรายการ" at the reveal.
- Guessing the campus or the faculty. They shape the answers but are never guessed.
- A live view while asking, and any map.
- Data collection, sharing and a backend.
- University facts from verified sources. Mark doubtful facts `unsure`, as Province does.

## Assumptions

Taken without asking, per the requirements gate. Veto any of them here.

- **The 38 universities.**
  - กรุงเทพและปริมณฑล (22): จุฬาลงกรณ์, ธรรมศาสตร์, มหิดล, เกษตรศาสตร์, ศรีนครินทรวิโรฒ, ศิลปากร, สจล. ลาดกระบัง, มจธ. บางมด, มจพ. พระนครเหนือ, รามคำแหง, กรุงเทพ, อัสสัมชัญ, รังสิต, ศรีปทุม, หอการค้าไทย, ธุรกิจบัณฑิตย์, สยาม, หัวเฉียวเฉลิมพระเกียรติ, เกษมบัณฑิต, เทคโนโลยีมหานคร, สถาบันเทคโนโลยีไทย-ญี่ปุ่น, สถาบันการจัดการปัญญาภิวัฒน์.
  - ภาคเหนือ (6): เชียงใหม่, แม่โจ้, แม่ฟ้าหลวง, นเรศวร, พะเยา, พายัพ.
  - ภาคอีสาน (4): ขอนแก่น, มหาสารคาม, อุบลราชธานี, เทคโนโลยีสุรนารี.
  - ภาคใต้ (3): สงขลานครินทร์, วลัยลักษณ์, ทักษิณ.
  - ภาคตะวันออก (1): บูรพา.
- **The player** answers about the university where they did their bachelor's, at the campus where they spent most of it. The intro says so.
- **The prior is uniform**, as in Province. Enrollment weighting would make รามคำแหง the default guess.
- **The guess sentence** is "คุณเรียนที่<full name>", such as "คุณเรียนที่จุฬาลงกรณ์มหาวิทยาลัย" and "คุณเรียนที่มหาวิทยาลัยเชียงใหม่".
- **Signatures may be campus places**, unlike Province's, because a campus landmark or canteen is insider knowledge rather than "what are you near".
- **The facts are written from general knowledge**, as Province's were, and every doubtful fact is marked `unsure`.
