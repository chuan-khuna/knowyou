# Anime Age engine design

The design of the Anime Age engine, its question facts schema, and the model that turns question facts into answer probabilities. Terms follow `GLOSSARY.md`. Requirements are in `.scratch/anime-age/spec.md`.

This design combines two independent design candidates from the architect step on 2026-11-25. The engine contract comes from candidate 2. The schema and the derivation model come from candidate 1. Both agreed on everything in "Shared core" below.

## Shared core

- **A play is an immutable value.** `answer(play, key)` returns a new play and never changes the old one. The same seed and the same answers always give the same play. Calling `answer` twice on one play gives equal results, so a double tap or React StrictMode is harmless.
- **The phase is part of the type.** A play is either `AskingPlay` or `FinishedPlay`. Only a finished play has a guess, and `answer` accepts only an asking play. A second guess, or an answer after the guess, is a compile error.
- **Answers are identified by key, not position.** The play screen maps number key 1 to the first option's key. Recorded personas stay valid when options are reordered.
- **Probabilities are compiled once.** When the engine is created, every question becomes one `Float64Array(41)` per answer: P(answer | age) for ages 10–50. Bayes updates and question selection only read these arrays.
- **Neighbouring ages share evidence through the probabilities, not the belief.** Each question's probabilities are smoothed across ages once, at compile time (Gaussian, σ about 1 year). Smoothing the posterior after every update would blur the same evidence again and again, and confidence could never reach the threshold.
- **No probability is ever zero.** Each answer's probabilities are mixed with a 4% uniform floor. One careless answer lowers the true age's probability but never rules it out, so nenrei's backtracking isn't needed.
- **Confidence equals the chance of a hit.** The guess is the centre of the 3-age window with the most posterior mass, and confidence is that mass. The meter, the stop rule and the hit test use this one rule. The edge bins hold several real ages, so a window next to an edge counts only the share of the edge bin within one year of its centre (bin 10 counts 0.4 toward a guess of 11, by the edge-fold weights). Without this, centre 11 always outweighs centre 10 and the "ไม่เกิน 10 ปี" guess could never be made.
- **Question choice.** Expected information gain in bits, scaled down for a franchise already asked. One question is drawn at random from a shortlist near the best gain, using a generator seeded from (seed, step). Plays vary, but a clearly weaker question is never asked. Expected information gain moves from coarse to fine on its own, so there's no coded phase switch.
- **Stop rule.** Stop at 45 answers, or when the question bank is used up. After 12 answers, also stop when confidence reaches 0.88 or the best gain drops below 0.01 bits. These numbers live in one exported constant, `ANIME_AGE_RULES`.
- **Persona replay.** A persona is replayed on an engine built from only the questions it answered, so the engine needs no persona flag.

## Engine contract (shared with future games)

The play screen imports only this contract and one engine value.

```ts
interface Engine<TValue, TExtras> {
  start(options: { seed: number }): Play<TValue, TExtras>;
  answer(play: AskingPlay, answerKey: string): Play<TValue, TExtras>;
}
type Play<V, X> = AskingPlay | FinishedPlay<V, X>;

interface PlayBase { seed: number; answers: AnsweredQuestion[]; confidence: number }
interface AskingPlay extends PlayBase { phase: "asking"; questionNumber: number; question: QuestionCard }
interface FinishedPlay<V, X> extends PlayBase {
  phase: "finished";
  guess: { value: V; label: string };   // label is the Thai sentence, e.g. "คุณอายุ 27 ปี"
  questionsAsked: number;
  decidingAnswer: number | null;          // index into answers
  extras: X;                              // game-only result data; Anime Age: memory strata
}
```

- **The answer log is the only state.** A play stores its seed and its answers. Everything else (posterior, confidence, next question, guess) is rebuilt from them, so no cached belief can drift from the log. The rebuild costs about 41 × 45 multiplications.
- Since Province, an asking play may also carry an optional, game-typed `live` field (`AskingPlay<TLive = never>`, a third type parameter on `Play` and `Engine`) that the game's own live view reads. Anime Age leaves it out. See `province-engine.md`.
- The play screen never needs the game's value type. It reads `guess.label`. Only each game's result screen reads `extras`.
- The Anime Age engine adds one method beyond the contract, `answerCurves(id)`. The simulated players and the author's curve preview both read exactly the compiled tables, overrides included.
- `src/games/anime-age/index.ts` is the only entry point. A boundaries test fails on any import of the module's internals from outside it.

## Question facts schema

- **Four builders**: `series(...)`, `film(...)`, `choice(...)`, and `pick(...)` from `pickFrom(titleFiles)`. The author never writes `kind`.
- **Every question shows 4–5 options.** Each option has one clear meaning that fits its question, and options are mutually exclusive. An option may carry a `hint`, a short Thai line under its label. Where several options could seem to apply, the hint or the question's aside says which one to pick. Labels are unique within a question, and the don't-know answer is always last.
  - Series answers: `lot` (ติดตามดูประจำ, hint "ดูหลายตอน หรือดูจนจบ"), `seen` (เคยดูบ้าง, hint "ดูไม่กี่ตอน หรือดูผ่าน ๆ"), `name` (รู้จักแค่ชื่อ, hint "เคยได้ยินหรือเห็นผ่านตา แต่ไม่เคยดู"), `none` (ไม่รู้จักเลย).
  - Film answers: `cinema` (ดูในโรงหนัง, hint "ถ้าเคยดูทั้งในโรงและที่บ้าน เลือกข้อนี้"), `screen` (ดูที่บ้าน, hint "ทางทีวี แผ่น หรือสตรีมมิ่ง"), `name`, `none`.
  - For a title, ไม่รู้จักเลย is the don't-know answer. There is no separate "จำไม่ได้", because it would overlap with it.
  - Choice questions: 3–4 author choices, each with an optional hint, plus an automatic `unsure` (ไม่แน่ใจ / จำไม่ได้). Writing `unsure` by hand is a compile error. The choices are written so that each real person at the asked life stage has exactly one fitting answer: a "most often" question names the single most frequent thing, and a "did not watch" choice appears where not watching is common. No catch-all "อื่น ๆ" unless it is a real, distinct answer. An optional `aside` under the prompt says how to pick.
  - Pick questions: a prompt tied to a life stage, such as "ตอนประถม คุณดูเรื่องไหนบ่อยที่สุด?", and three title choices. Each choice references an existing title question by id, checked by the type checker against the title ids of the files passed to `pickFrom`. The answer keys are the three title ids, `neither` (ไม่ได้ดูเรื่องไหนเลย) and `unsure` (จำไม่ได้). Answers are single-select, because the engine treats every answer as one key with one likelihood row. The author picks three titles from clearly different eras.
- **The bank is objects keyed by question id.** A duplicate id within one file is a compile error. `defineBank(...parts)` merges the files and checks, once at load, the rules types can't express:
  - duplicate ids across files
  - `from ≤ to`
  - the outlet's operating years (for example, iTV only from 1996 to 2007)
  - a choice `share` above 0
  - a choice question with 3–4 choices (the type checker does not count union members, so this is a load check)
  - unique answer labels within a question
  - a pick that names three different titles, not all from one franchise
  - override sums of at most 1 at every age
- **Closed types** for `Year` (1960–2026), `Age` (10–50), `Outlet`, `Audience` (kids, teens, general, adults) and `Reach` (phenomenon, hit, known, niche).
- **A title question records:**
  - its Thai title and an optional aside line
  - its Thai `runs`, each `{ on: Outlet, from, to: Year | "now" }`; a rerun on another outlet is another run
  - its audience and reach
  - an optional franchise, for correlated evidence
  - an optional `unsure` list of facts the author doubts, which is where to look first when a persona misses
- **Overrides** are probabilities at a few ages, filled in linearly between them and held flat beyond the outermost ones: `{ none: { 10: 0.04, 30: 0.03, 50: 0.08 } }`. Answers without an override keep their derived shape and are rescaled to fill the rest.
- **Overrides on pick questions** are keyed by the pick's own answer keys, the title ids plus `neither` and `unsure`.
- **Personas** are typed against the bank, `{ [Id in QuestionId]?: AnswerOf<Id> }`, so a renamed question or a wrong answer key breaks the persona at compile time. Each persona also stores the year it was recorded.

## Derivation model

`curve(question)` is the only source of P(answer | age). The engine, the simulated player and `bun run curve <id>` all call it. For raw age x the birth year is b = 2026 − x, and t = y − b is the player's age in year y. Every tuning knob is a named table, which personas are there to correct.

- **Series.**
  - Engagement each year: e_y = max over runs of access(outlet, y) × receptivity(audience, t), counted only for t ≥ 4.
  - Opportunity: O = 1 − Π(1 − 0.35·e_y).
  - watched = C_reach·O, and lot = watched·D_reach·max e_y.
  - fame = max(L_reach, F_reach·min(1, presence/6)), where presence counts the years from the first run to the last run plus the reach's tail, at ages 8 and up. A phenomenon's tail is infinite, which models classics everyone has heard of. L_reach is the name recognition that outlasts the tail through reruns, memes and talk. Without it a 1980s hit's name was unknowable to anyone born after the tail, so "รู้จักแค่ชื่อ" pinned the age far too hard.
  - parent = C·pull_audience·max access·Ψ(t), where Ψ is the share of people aged t with a child aged 4–11 at home. This models parents knowing kids' shows.
  - know = 1 − (1−watched)(1−fame)(1−parent).
  - seen = watched − lot + 0.25·parent·(1−watched), the co-viewing parent.
  - name = know − lot − seen, and none = 1 − know.
- **Film.**
  - cinema = C·receptivity(t_release)·cinemaGoing(t_release).
  - screen = (C − cinema)·opportunity over the later runs.
  - name and none work as for a series.
- **Choice.** The life stage (primary 6–12, secondary 13–18, university 18–22) gives a window of calendar years. Each choice's weight is its share × its mean prevalence over that window. unsure = base + memory fade + the part of the stage not yet lived. So a 10-year-old asked about university answers "unsure", and that answer is itself evidence.
- **Pick.** The same life-stage window and `unsure` as a choice question. For each referenced title, w_c is the chance it was watched during the window, from the same viewing model as the title's own curve (series opportunity, or film cinema plus later screens) restricted to the window's years. neither = (1 − unsure)·Π(1 − w_c), and each title gets (1 − unsure)(1 − Π(1 − w_c)) in proportion to w_c. The same formula serves "most often", "first" and "what classmates talked about" prompts: it models which title the player met during the stage, not the exact wording.
- **Then, in order:**
  1. Fold the edge bins: bin 10 is a weighted mean of ages 7–10, and bin 50 of ages 50–58. This makes the edges mean "≤10" and "≥50".
  2. Smooth across ages (σ = 1).
  3. Apply any override.
  4. Apply the 4% floor.

  Each step turns valid distributions into valid distributions.

## Result

- **Guess.** A centre of 10 or 50 collapses to "ไม่เกิน 10 ปี" or "50 ปีขึ้นไป", and the hit test counts it as a hit for every age on that side.
- **Deciding answer.** The answer that raised the mass of the final guess's window the most.
- **Memory strata.** Six era bands, labelled in ค.ศ. (Common Era) years. Each band's knowledge comes from the answers to its titles where they were asked. Otherwise it is the familiarity expected under the final posterior, marked `basis: "inferred"` so the screen can fade its bar. A band with no titles is `"empty"`. Titles whose runs span more than 12 years, such as Doraemon, are left out of strata because they carry no era signal.

## Decisions taken for v1

- **Hit-rate target.** The simulated-player suite needs at least 80% hits pooled over all ages, with no single age below 50%.
- **Strata labels.** Labelled in ค.ศ., because anime airing years are usually quoted in Common Era years (changed from พ.ศ. at the user's request on 2026-11-25).
- **Not modelled.** Gender and recall decay. Personas will show whether either is needed.
- **Facts are unverified.** Airing facts are written from memory. Any shaky fact is listed in its question's `unsure`.
