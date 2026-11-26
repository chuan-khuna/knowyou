# Spec: Dragon Ball and Reborn quizzes, any play length, and a reveal switch

Status: done

Terms follow `GLOSSARY.md`. The quiz module and screen are described in `docs/documents/quiz.md`. `.scratch/naruto-quiz/spec.md` set the precedent for adding a title, and `.scratch/quiz-no-reveal/spec.md` held the answers until the result.

The user supplied two researched banks:

- `/Users/altr/OpenBot/Shared/dragon-ball-quiz/`: 150 questions (38, 38, 37, 37 by tier) and 32 glosses.
- `/Users/altr/OpenBot/Shared/reborn-quiz/`: 150 questions (38, 38, 37, 37) and 33 glosses.

Each folder also has a topic sheet, hand-over notes and the Thai-name sources. Both banks pass `quizIssues` as they are.

## Problem Statement

A play is always 20 questions, or the whole bank in ตอบทุกข้อ. A fan who wants a longer test, such as 50, or a short one, can't have it. The answers wait until the result, which suits a test but not a player who wants to learn as they go. Some players want each answer right away, and want to switch mid-play. And Dragon Ball and Reborn fans have no quiz.

## Solution

Two new titles, คุณรู้จัก Dragon Ball ดีแค่ไหน at `/dragon-ball` and คุณรู้จัก Reborn ดีแค่ไหน at `/reborn`, listed under ควิซ on the home page.

On every quiz's intro the player picks how many questions to play: 20, 50, ทั้งหมด, or any number they type. The play draws that many, spread evenly over the tiers, easiest tier first. Every play ends with a fan title: the score is scaled to a score out of 20 and looked up in the title's bands, so 40 out of 50 earns the 16 band.

A switch, เฉลยทุกข้อ, sits on the intro and in the top strip during a play. When it is on, each answer shows right or wrong, the right answer and the note, and the top strip shows the running score. When it is off, the play goes straight to the next question, as now. The player can flip it at any time, and the choice is remembered.

## User Stories

1. As a Dragon Ball fan, I want a Dragon Ball quiz with a fan title, so that I can test how well I know the series.
2. As a Reborn fan, I want a Reborn quiz with a fan title, for the same reason.
3. As a player, I want to choose 20, 50 or all of the questions in one tap, so that common lengths are quick to pick.
4. As a player, I want to type any number of questions, so that I can play exactly as long as I want.
5. As a player, I want a fan title whatever length I chose, so that a long play is rewarded as well as a short one.
6. As a player, I want to choose whether each answer is shown right away, so that I can learn as I go or test myself.
7. As a player, I want to flip that choice mid-play, so that I can change my mind without starting over.
8. As a player, I want the choice remembered, so that I don't set it every play.
9. As a player with a play saved before this change, I want it to restore as before.
10. As a player, I want a move named in a question to show its Japanese and English names, as an option does, so that I recognise it whichever name I know. (Asked mid-work: "ถ้ามีชื่อท่าไม้ตายใดๆ อยู่ในคำถาม ให้เพิ่มหมายเหตุด้วย", with ไซกิ คัมปัตสึ โนะ คิวามิ as the example.)

## Implementation Decisions

- **Play length replaces modes.** A play holds `count` in place of `mode`. `start(seed, count?)` defaults to 20. `ตอบทุกข้อ` is the bank's size. `QUIZ_MODES` and `QuizMode` go.
- **Drawing a count.** The draw deals the count round-robin over the tiers, easiest first, skipping a tier that has no questions left. 20 gives 5 per tier and the bank's size gives every question, so both draw exactly what they drew before. 50 gives 13, 13, 12 and 12.
- **Allowed counts.** From 5 to the bank's size. `start` throws outside that range.
- **Fan title.** Every finished play has a band. Its score out of 20 is `Math.round(score * 20 / total)`. The bands themselves don't change.
- **Saved play.** The record stays `v: 1` and gains `count`, left out for 20. An old record with `mode: "all"` restores as the bank's size. A count outside the allowed range drops the record.
- **Reveal switch.** A preference like the sound switch, in localStorage under `knowyou:quiz-reveal`, off by default, shared by every title. It is not part of the saved play. With it on, the screen shows the reveal after each answer, the running score and the `right` or `wrong` sound. With it off, the screen behaves as now. Turning it off during a reveal moves on to the next question. Turning it on shows the reveal from the next answer.
- **Intro.** The count picker (20, 50, ทั้งหมด (N), and a number field) and the reveal switch sit above เริ่มเลย. The separate ตอบทุกข้อ button goes. Each title's intro copy no longer states a fixed count or says answers are shown at once.
- **New titles.** `src/games/dragon-ball/` and `src/games/reborn/`, built like Naruto. Each bank file's `questions` array becomes `questions.json` and its `glossary` becomes `glossary.json`, as they are. Bands:

  | Score | Dragon Ball title | Line |
  | --- | --- | --- |
  | 0–4 | ชาวบ้านธรรมดา | ยังขี่เมฆสีทองไม่ได้เลย กลับไปส่งนมกับผู้เฒ่าเต่าก่อนนะ |
  | 5–8 | ศิษย์สำนักเต่า | ได้เสื้อสีส้มมาแล้ว แต่ยังต้องแบกกระดองเต่าวิ่งอีกหลายรอบ |
  | 9–12 | นักสู้ศึกชิงเจ้ายุทธภพ | ฝีมือขนาดนี้ ผ่านเข้ารอบสุดท้ายของศึกชิงเจ้ายุทธภพได้สบาย |
  | 13–16 | ซูเปอร์ไซย่า | ผมเปลี่ยนเป็นสีทองแล้ว ความรู้ของคุณระเบิดออกมาเต็มที่ |
  | 17–20 | นักรบผู้ปกป้องโลก | ต่อให้จอมมารบูมาก็ไม่กลัว คุณรู้จักดราก้อนบอลทุกซอกทุกมุม |

  | Score | Reborn title | Line |
  | --- | --- | --- |
  | 0–4 | สึนะไม่ได้เรื่อง | ยังไม่โดนกระสุนดับเครื่องชนสักนัด รีบอร์นคงต้องเริ่มสอนใหม่ตั้งแต่ต้น |
  | 5–8 | ลูกน้องแฟมิลี่ | เข้าแฟมิลี่มาแล้ว แต่ยังต้องคอยหลบบาซูก้าทศวรรษของแรมโบ้ |
  | 9–12 | ผู้พิทักษ์วองโกเล่ | ได้แหวนวองโกเล่มาแล้ว พร้อมออกศึกปกป้องบอสของคุณ |
  | 13–16 | สมาชิกวาเรีย | ฝีมือระดับนี้ ซันซัสคงอยากชวนเข้าหน่วยลอบสังหาร |
  | 17–20 | บอสวองโกเล่รุ่นที่ 10 | รีบอร์นยอมรับคุณแล้ว คุณพร้อมสืบทอดวองโกเล่ |

- **Prompt terms.** Each question card lists the glossary labels its prompt names, found on Thai word boundaries (`Intl.Segmenter("th")`) so นภา is not found inside ในภาคอนาคต, longest first, each once. The question and reveal screens show each under the prompt with its gloss. `quizIssues` accepts a gloss that names a prompt term and no option.
- **Docs.** `quiz.md` covers counts, prompt terms, the scaled fan title, the reveal switch and both new titles. `GLOSSARY.md`'s Quiz entry names the four titles. The stale intro lines go.

## Testing Decisions

- **Shared module**, through its public interface: a count of 20 and the bank's size draw the same plays as before for a set of seeds; 50 draws 13, 13, 12, 12; a count is dealt over the tiers, capped by each tier's size; counts outside 5 to the bank's size throw; every finished play has a band, scaled to 20; a record with `count` round-trips; an old `mode: "all"` record restores as the bank's size; a bad count drops the record.
- **Per title**: each new title's shipped content passes `quizIssues`, plus a boundaries test.
- **UI**, in the running app: pick 50 and play to a fan title; type a count; switch the reveal on mid-play and see the next answer revealed with the score; switch it off during a reveal and move on; refresh and keep the play and the switch.

## Out of Scope

- New questions or edits to either supplied bank.
- A count or reveal setting per title.
- Changes to the games.

## Assumptions

Taken without asking, per `CLAUDE.md`. Veto any of these by editing this list.

- The user chose a fan title on every play, scaled to 20 (asked in chat).
- The reveal switch is off by default, because the user last asked for answers to wait.
- The switch is one preference for every title, remembered like the sound switch.
- The smallest count is 5, so a fan title still means something.
- The presets are 20, 50 and ทั้งหมด, with 20 picked by default. The last count is not remembered.
- The titles use the English series names, as the first two do: Dragon Ball and Reborn. Routes `/dragon-ball` and `/reborn`.
- The fan titles and lines in the tables above. Change the wording freely.
- Home blurbs drop the fixed 20: "ตอบคำถามแล้วดูว่าคุณเป็นนักสู้ระดับไหน" and "ตอบคำถามแล้วดูว่าคุณอยู่ระดับไหนในแฟมิลี่", and the existing two lose "20 ข้อ" the same way.
- The banks ship as they are. The Thai-name sources and hand-over notes stay in the user's folders and are not copied into the repo.

## Comments

- 2026-11-26: Committed to main as c37b3e1.
