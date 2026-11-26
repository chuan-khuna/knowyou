# University engine design

The design of the University game: its university facts, question facts schema, the model that turns them into answer probabilities, the engine and the measured results. Terms follow `GLOSSARY.md`. Requirements are in `.scratch/university/spec.md`. Province (`province-engine.md`) is the precedent for every shape not stated here.

## Module

`src/games/university/` owns the engine, facts, bank and tests behind one entry point, `index.ts`. `boundaries.test.ts` fails on any import of the module's internals from outside it. It shares no code with Province: each game owns its engine, a recorded user decision.

| File | What it holds |
| --- | --- |
| `ids.ts` | The 36 stable university ids. Their order is the index order of every belief array. |
| `universities.ts` | `UNIVERSITIES`, one typed table of university facts keyed by id. |
| `schema.ts` | The question facts types, the `lean` builder, and `defineBank`. |
| `derive.ts` | Question facts to P(option \| university); pick question rows. |
| `bank/` | The question bank in three parts: life, study, place. |
| `engine.ts` | `createUniversityEngine` and `UNIVERSITY_RULES`. |
| `personas/` | Recorded players and their replay. |
| `testing/` | The simulated player. |

## University facts

Each university records its full Thai name, the short name players use (จุฬาฯ, มธ., มช.), its area, public or private, a field mix, a setting mix, tags and at least two signatures.

- **The universities.** 36, as the spec's Assumptions list them: 22 in Bangkok and its surroundings, 6 in the north, 4 in the northeast, 3 in the south and 1 in the east. The spec's heading says 38, but its list sums to 36.
- **Area.** `bangkok`, `north`, `northeast`, `south` or `east`. The result's picker lists them in that order, as กรุงเทพและปริมณฑล, ภาคเหนือ, ภาคอีสาน, ภาคใต้, ภาคตะวันออก.
- **The field mix** is the share of undergraduates in each field group. It sums to 1.
  - `health`: medicine, nursing, pharmacy and other health programmes.
  - `tech`: science, engineering, IT and agriculture.
  - `business`: business, accounting and economics.
  - `arts`: communication, fine arts, design and architecture.
  - `social`: humanities, social science, education and law.
- **The setting mix** is the share of undergraduates at a campus in each setting: `downtown` (a big city's centre), `suburb` (a city's edge), `town` (a provincial town) or `countryside` (out of town). It sums to 1, so a university with several campuses spreads across them.
- **Tags** mark campus traits that cut across area and type. A test checks every tag a university carries is read by some question.

  | Tag | Meaning |
  | --- | --- |
  | `sotus` | ห้องเชียร์ and ว้าก: a strict welcome |
  | `football-classic` | ฟุตบอลประเพณี against a rival university |
  | `shuttle` | A free bus or tram around campus |
  | `rail` | A BTS, MRT or Airport Rail Link station at the gate |
  | `first-year-dorm` | Most first years live in campus dorms |
  | `farm` | A campus farm that sells its milk or produce |
  | `lake`, `hill`, `sea` | A lake on campus, hills by campus, the sea a short ride away |
  | `english`, `chinese`, `japanese` | Teaching in English; Chinese or Japanese taught to everyone, or a large Chinese community |
  | `christian` | A Christian foundation, with chapel and Christmas on campus |
  | `open-admission` | No entrance exam |
  | `work-based` | Terms alternate with paid work placements |
  | `trimester` | Three terms a year |
  | `uniform` | The uniform is checked every day |
  | `hospital` | A university hospital on campus that students use |
  | `rangsit` | The Rangsit cluster, by Future Park Rangsit |
  | `bkk-central`, `bkk-north`, `bkk-east`, `bkk-west` | Which side of Bangkok the main campus sits on |

- **Signatures** are traditions, campus places, foods or songs a student there would recognise, such as รับน้องขึ้นดอย, อ่างแก้ว and เพลงลาภูพิงค์ for Chiang Mai University. Unlike Province's, a signature may be a campus place. No two universities share one, and a test checks no signature contains its own university's name or short name.
- **Sources.** The facts are written from general knowledge, not verified sources. Doubtful facts are listed in each university's `unsure`; see "Facts in doubt".

## Question facts

Every question is a lean. There is no geography kind. Every question gets "ไม่แน่ใจ" as its last option, with the same probability (5%) at every university, so it never moves belief.

### Lean

Each option leans toward some areas, public or private, field groups, settings or tags. An option's weight for a university is:

- the option's weight for the university's area, if the question uses area (a single-valued fact, so the weight acts as an indicator; a missing weight counts 0),
- times the option's weight for public or private, if the question uses it, in the same way,
- times the sum of the university's field shares times the option's field weights, if the question uses fields,
- times the same sum over settings, if the question uses settings,
- times the option's `base` (default 1),
- times 1 + the option's boost for each tag the university carries. A boost of 9 makes the option ten times likelier; −0.8 cuts it to a fifth.

This is Province's lean formula with University's dimensions. An `override` gives explicit relative weights for one university's row: the mall question gives จุฬาฯ its own row, because only it sits at Siam.

### The bank

26 questions. `defineBank` caps place questions at 5 and keeps Province's other checks.

- **Campus life, 16.** How the faculty welcomed first years, getting to class, moving between buildings, how far the farthest building is, where you ate lunch, where you read before exams, what you wore, the event the whole campus waited for, what is in the middle of campus, how far the night market is, where you lived in first year, what religious life you saw, which mall you went to, whether the campus farm sells its produce, where you saw a doctor, and what friends did at the weekend.
- **Study, 5.** Your field group, the language you studied in besides Thai, how you got in, where your classmates came from, and how many terms a year.
- **Place, 5.** The area, the campus setting, the fees, the view from the classroom, and which side of Bangkok.

### From facts to probabilities

`rowsFor` normalizes each university's option weights, mixes in a 6% uniform floor so one careless answer never rules a university out, scales by 95%, and appends ไม่แน่ใจ at 5%. Each question compiles once into one `Float64Array(36)` per option.

## Engine

- **The contract.** `Engine<UniversityId, UniversityExtras>`, with no live type. A play is an immutable value: its seed and its answer log. Belief, confidence, the next question and the guess are rebuilt from those two.
- **Belief.** A uniform prior over 36 universities, multiplied by each answer's row. The guess is the top university; confidence is its belief. A hit is the exact university. The guess reads "คุณเรียนที่" and the full name, such as "คุณเรียนที่มหาวิทยาลัยเชียงใหม่".
- **Question choice.** Expected information gain in bits over the unasked bank questions and, when allowed, one pick question. One is drawn from a shortlist of at most 3 within 70% of the best gain, by a generator seeded from (seed, step), as in Province.
- **Pick questions.** "อันไหนคุ้นที่สุดสำหรับมหาวิทยาลัยของคุณ?". From the 4 front-runners with an unused signature, the next unused signature each, in an order shuffled by (seed, step). Options: the signatures, "ไม่มีอันไหนเลย", "ไม่แน่ใจ". A student picks their own university's signature (weight 10). A signature from another university in the same area has weight 1.5, and one from another area 0.3. This replaces Province's distance falloff. "None" has weight 3. At most 4 per play, never two in a row, and only after 4 answers.
- **The pick question's id names it.** `pick:cmu.0+kku.1+...` lists each owner and signature index in option order, so the answer log alone rebuilds the question. Plays stay reproducible and a saved play restores exactly.
- **Stop rule.** Stop at 24 answers or when nothing is left to ask. After 12, also stop at confidence 0.95 or when the best gain is under 0.02 bits.
- **Result data.** `extras` holds the final belief, the top 3 candidates, and the 2 answers that raised the guess's odds most against the average university still in the running at that moment. `decidingAnswer` is the first of those.
- **Rules.** Every number above is in `UNIVERSITY_RULES`, at Province's values.

## Result screen

The guess on the gold sheet. The reveal asks whether the guess is right. If it isn't, the player picks their university from a list grouped by area that ends with "ไม่มีในรายการ". The screen then shows the top 3 candidates with their chances, the 2 answers that pointed hardest at the guess, the answers list and play again. With no map, the top 3 list marks the player's real university when it is among them. The dev build's persona copy button shows only once a listed university is confirmed.

## Measured results

Simulated players (`simulated-players.test.ts`, or `bun scripts/university-sim.ts [plays]` for per-university detail) play 40 seeded plays per university, 1440 in all, answering from the engine's own rows.

| Measure | Untuned bank | Tuned bank | Asserted at least |
| --- | --- | --- | --- |
| Exact university | 0.827 | 0.906 | 0.88 |
| True university in the top 3 | 0.951 | 0.979 | 0.96 |
| Right area | 0.992 | 0.994 | 0.98 |
| Worst university | 0.55 (Sripatum, DPU) | 0.75 (Mahanakorn, UBU) | 0.50 |
| Mean questions | 15.4 | 14.3 | at most 17 |

- **What the tuning was.** Two bank questions, each from a real campus fact. The first is which side of Bangkok the campus sits on; it replaced a question about the cold season, which only repeated the area question. The second asks where you saw a doctor, which reads a new `hospital` tag. Together they moved exact from 0.827 to 0.906.
- **What did not move it.** Each rule change landed within about one standard error (0.008) of 0.906: up to 6 or 8 pick questions, a gain floor of 0.01 or 0.05 bits, picks from the third or sixth answer, 3 pick owners, a minimum of 10 questions, a confidence target of 0.97. The rules stay at Province's values.
- **The pick weights stay at their starting values.** Lowering the same-area weight to 1 and the other-area weight to 0.2 reads exact 0.919. But the simulated player answers from those same weights, so that gain partly measures the model agreeing with itself. It does not show that real students confuse signatures less.
- **How the thresholds were set.** Each is the tuned measure less about three standard errors of a binomial rate at this sample size: about 0.008 for the pooled exact rate over 1440 plays, about 0.07 for one university over 40 plays. A bank edit that changes which seeds hit won't fail the suite by chance; a real regression will. They are never loosened to make a change pass.
- **What limits the number.** About a third of plays stop on the low-gain rule below 0.95 confidence. Their misses fall on pairs whose facts are nearly the same: UBU and MSU (both northeast, out of town, public, a strict welcome), Bangkok University and Rangsit University (both private, both at Rangsit), TNI and Kasem Bundit (both east Bangkok, business-heavy). Only pick questions tell those pairs apart, and more pick questions did not help. So the limit is how much the facts distinguish those universities, not the stop rule.
- **What the number does not show.** A simulated player answers from the model's own rows, and the engine treats answers as independent. Several life questions read the same setting mix (getting to class, moving between buildings, building distance, lunch), so real answers will agree with each other more than the model expects, and real confidence will run high. The `side` question carries much of the Bangkok split, so a player who isn't sure which side of Bangkok their campus is on loses most of it. Personas, not this suite, will show how far.

## Personas

`personas/` records real players' answers to the bank's questions with their university, typed per question. Replay builds an engine from only the answered questions, with pick questions off, because a pick question depends on the play. The one persona is a placeholder for a typical Chiang Mai University engineering student, written by the bank's author and marked as a placeholder; it hits.

## Facts in doubt

- **Signatures marked `unsure`.** มหิดล, มศว, สจล., มจธ., มจพ., ม.ราม, ม.กรุงเทพ, เอแบค, ม.รังสิต, ม.ศรีปทุม, ม.หอการค้า, DPU, ม.สยาม, ม.หัวเฉียว, ม.เกษมบัณฑิต, ม.มหานคร, ม.แม่โจ้, มฟล., มน., ม.พะเยา, ม.พายัพ, มมส., ม.อุบลฯ, มวล. and มทษ. Most are campus streets or nearby landmarks rather than insider traditions, because the author knows those universities' campus life less well.
- **Tags marked `unsure`.**
  - มก.: a strict welcome.
  - ม.กรุงเทพ: a free shuttle.
  - ม.ศรีปทุม: a daily uniform check.
  - DPU and ม.สยาม: a large Chinese community.
  - มช., มน., ม.พะเยา and มมส.: a hospital on the main campus.
  - มน.: a strict welcome.
  - ม.พายัพ: teaching in English.
- **Question weights marked `unsure`.** The prayer-room option in the religion question, and the lowest and highest fee bands.
- **Coarse by design.** Field and setting mixes are rough shares, not enrolment data. Each university sits in one area, even where a branch campus is in another, such as ศิลปากร at Nakhon Pathom and Phetchaburi, or ม.อ. at Pattani and Phuket. The prior is uniform rather than enrolment-weighted, so รามคำแหง is not the default guess.
