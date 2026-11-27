# Province engine design

The design of the Province game: its province facts, question facts schema, the model that turns them into answer probabilities, the engine, the maps and the measured results. Terms follow `GLOSSARY.md`. Requirements are in `.scratch/province/spec.md`. Anime Age (`anime-age-engine.md`) is the precedent for every shape not stated here.

## Module

`src/games/province/` owns the engine, facts, bank, maps and tests behind one entry point, `index.ts`. `boundaries.test.ts` fails on any import of the module's internals from outside it.

| File | What it holds |
| --- | --- |
| `ids.ts` | The 77 stable province ids and their ISO 3166-2 codes. Its order is the index order of every belief array. |
| `provinces.ts` | `PROVINCES`, one typed table of province facts keyed by id. |
| `schema.ts` | The question facts types, the `lean` and `geo` builders, and `defineBank`. |
| `derive.ts` | Question facts to P(option \| province); geography measures; pick question rows. |
| `bank/` | The question bank in four parts: language, food, culture, geography. |
| `engine.ts` | `createProvinceEngine` and `PROVINCE_RULES`. |
| `map/shapes.ts` | Generated SVG path data. Never edited by hand. |
| `personas/` | Recorded players and their replay. |

## Province facts

Each province records its Thai name, region (the official six-region split: north 9, northeast 20, central 22, east 7, west 5, south 14), capital coordinates, dialect mix, terrain (0 to 2), coast, land borders, Muslim share, culture tags and at least two signatures.

- The dialect mix is the share of people speaking each home dialect: กลาง (`klang`), คำเมือง (`muang`), อีสาน/ลาว (`isan`), ใต้ (`tai`), เขมร/กูย (`khmer`), มลายู (`malay`). It sums to 1.
- Tags mark traits that cut across dialect and region: `suphan-accent`, `eastern-accent`, `chinese`, `jay-festival`, `hill-peoples`, `mon`, `dimsum-breakfast`, `boat-race`, `bullfight`, `buffalo-race`, `dove-contest`. A test checks every tag a province carries is read by some question.
- Signatures are foods, traditions or souvenirs, never landmarks. No two provinces share one.
- The facts are ported from the user-supplied prototype archive (name, region, capital, dialect mix, terrain, coast, border, Muslim share), then retyped and extended. They are written from general knowledge, not verified sources. Doubtful facts are listed in each province's `unsure`; see "Facts in doubt".

## Question facts

A question is one of two kinds. Every question gets "ไม่แน่ใจ" as its last option, with the same probability (5%) in every province, so it never moves belief.

### Lean

Language, food and culture questions are leans. Each option leans toward some dialects, faiths (Buddhist or Muslim, from the Muslim share), regions or tags. An option's weight for a province is:

- the product, over each dimension the question uses, of the province's shares times the option's weights (a weight the option leaves out counts 0),
- times the option's `base` (default 1),
- times 1 + the option's boost for each tag the province carries. A boost of 9 makes the option ten times likelier; −0.8 cuts it to a fifth.

This one formula covers the spec's derivations "by dialect", "by region" and "by tag", and mixes them in one question when needed, such as the sausage question, which multiplies a dialect lean by a faith lean so "ไม่กินหมู" follows the Muslim share. An `override` gives explicit relative weights for one province's row, for odd cases such as Phetchabun's tamarind in the fruit question.

### Geography

At most five, at the user's request. Each reads a measured fact: drive time to the sea, drive time to Bangkok (both as soft bins over a log-normal estimate, from the archive), terrain, how cold the cold season is (latitude plus terrain), and the nearest neighbouring country (an exponential falloff of distance to the nearest province on that border). The archive's Mekong, airport, metro, crop and rain questions are dropped.

### The bank

30 questions: 9 language (พูด, อร่อย, มะละกอ, ขนมจีน, อะไร, สวยมาก, ยาย, accent, other home languages), 10 food (everyday rice, the fermented staple, breakfast, น้ำพริก, noodles, dessert, sausage, ลาบ, the scent of curry, fruit), 6 culture (temple-fair show, festival, the sound of worship, cloth, local contests, Chinese festivals) and 5 geography.

### From facts to probabilities

`rowsFor` normalizes each province's option weights, mixes in a 6% uniform floor so one careless answer never rules a province out, scales by 95%, and appends ไม่แน่ใจ at 5%. Each question compiles once into one `Float64Array(77)` per option.

## Engine

- **The contract.** `Engine<ProvinceId, ProvinceExtras, ProvinceLive>`. A play is an immutable value: its seed and its answer log. Belief, confidence, the next question and the guess are rebuilt from those two.
- **Belief.** A uniform prior over 77 provinces, multiplied by each answer's row. The guess is the top province; confidence is its belief. A hit is the exact province.
- **Question choice.** Expected information gain in bits over the unasked bank questions and, when allowed, one pick question. One is drawn from a shortlist of at most 3 within 70% of the best gain, by a generator seeded from (seed, step), as in Anime Age.
- **Pick questions.** From the 4 front-runners with an unused signature, the next unused signature each, in an order shuffled by (seed, step). Options: the signatures, "ไม่มีอันไหนเลย", "ไม่แน่ใจ". A local picks their own province's signature (weight 10); a nearby province's signature is likely too (3 × e^(−km/50)); "none" has weight 1.5. At most 4 per play, never two in a row, and only after 4 answers.
- **The pick question's id names it.** `pick:chiang-mai.0+lampang.1+...` lists each owner and signature index in option order, so the answer log alone rebuilds the question. Plays stay reproducible and a saved play restores exactly.
- **Stop rule.** Stop at 24 answers or when nothing is left to ask. After 12, also stop at confidence 0.95 or when the best gain is under 0.02 bits.
- **Result data.** `extras` holds the final belief, the top 3 candidates, and the 2 answers that raised the guess's odds most against the average province still in the running at that moment. `decidingAnswer` is the first of those.
- **Live data.** Every asking play carries `live`: the current belief and whether the question asks about the neighbouring countries.
- **Rules.** Every number above is in `PROVINCE_RULES`, including the live map's fade threshold (`ruledOutBelow`, 1% of the leader's belief).

## Contract extension

`src/games/engine.ts` gained one optional, game-typed field: `AskingPlay<TLive = never>.live`, threaded through `Play` and `Engine` as a third type parameter defaulting to `never`. The play screen takes an optional `live` render prop and draws it beside the question. Anime Age passes no third parameter and compiles and behaves unchanged. A question figure field was tried for the neighbours map and removed once the live map took over that job.

## Maps

- **Source.** Natural Earth v5.1.2, 1:10m Cultural Vectors: admin-1 states and provinces for Thailand's 77 provinces (all present, Bueng Kan included), joined by ISO 3166-2 code, and admin-0 countries for Myanmar, Laos, Cambodia and Malaysia. Downloaded from `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/`. Natural Earth is in the public domain (`https://www.naturalearthdata.com/about/terms-of-use/`).
- **The lever.** `bun scripts/build-province-map.ts [--cache <dir>] [--tolerance <units>]` downloads the two files once into `node_modules/.cache/natural-earth`, projects them (equirectangular, longitude scaled by cos 13°, 100 units per degree), simplifies them with Douglas–Peucker at 0.6 units (about 0.7 km), rounds to whole units, writes compact relative path data, and clamps the neighbours to a frame 0.3° wider than Thailand. It writes `src/games/province/map/shapes.ts`. The app never ships GeoJSON.
- **Size.** 31.5 KB of path data, neighbours included, and a 36.7 KB module. The budget is 200 KB. `map.test.ts` checks the budget, one shape per province, and no shape without a province.
- **Live map.** Beside each question. Neighbours are muted context. A ruled-out province turns the plain paper-3 grey; the rest warm that grey toward the deep accent (`--color-accent-deep`, 25% to 100%) by the square root of their share of the leader's belief, so the leader is the strongest amber and no live province is quieter than a ruled-out one. While the nearest-neighbour question is on screen, the map grows, darkens the neighbours and names them in the body face; its `aria-label` names them too.
- **Result map.** The same map, tinted by the final belief, with the guess outlined in ink and the real province, once given, dashed in mint. Its `aria-label` says both.

## Measured results

Simulated players (`simulated-players.test.ts`, or `bun scripts/province-sim.ts [plays]` for per-province detail) play 20 seeded plays per province, answering from the engine's own rows.

| Measure | Baseline, before tuning | Asserted at least |
| --- | --- | --- |
| Exact province | 0.800 | 0.77 |
| True province in the top 3 | 0.940 | 0.91 |
| Right region | 0.974 | 0.94 |
| Worst province (Roi Et) | 0.45 | 0.20 |
| Mean questions | 13.0 | at most 16 |

- **How the thresholds were set.** Each is the baseline less about three standard errors of a binomial rate at this sample size: about 0.010 for the pooled exact rate over 1540 plays, about 0.11 for one province over 20 plays. A bank edit that changes which seeds hit won't fail the suite by chance; a real regression will. They are never loosened to make a change pass.
- **What limits the number.** 65% of plays stop on the low-gain rule after all four pick questions are spent, with confidence around 0.6. The static bank tells regions apart well (0.974) but cannot tell neighbours within a region apart, because most of its questions lean on dialect. Only pick questions and geography separate neighbours. Lowering the gain floor from 0.02 to 0.005 moved exact from 0.800 to 0.805 and added a question; raising it to 0.05 gave 0.794. So the ceiling is the information in the bank and the four-pick cap, not the stop rule.
- **What the number does not show.** A simulated player answers from the model's own rows, and the engine treats answers as independent. Real players will make the dialect questions agree with each other more than the model expects, so real confidence will run high. Personas, not this suite, will show how far.

## Personas

`personas/` records real players' answers to the bank's questions with their home province, typed per question. Replay builds an engine from only the answered questions, with pick questions off, because a pick question depends on the play. The one persona is a placeholder for a typical Chiang Mai player, written by the bank's author and marked as a placeholder; it hits. The result screen's dev build copies a finished play as a persona file once the player confirms their province.

## Facts in doubt

- **Province facts marked `unsure`.** Signatures for ลำปาง, พะเยา, บึงกาฬ, มหาสารคาม, หนองบัวลำภู, อำนาจเจริญ, ตราด, สระแก้ว, พังงา, ระนอง and สตูล. The tags of อ่างทอง (Suphan-style accent) and ยะลา (dim sum breakfast, Chinese community). สระแก้ว's dialect mix.
- **Question weights marked `unsure`.** "ไหร" for อะไร, "งามจังหู / งามแรง", "แม่ใหญ่ / แม่เฒ่า" and "โต๊ะ / มะ" for grandmother, roti as breakfast, ซัมบัล, Malay sweets, the pomelo and coconut fruit option, and which provinces race long boats.
- **Coarse by design.** Muslim shares outside the south are a flat 0.5%; Bangkok's dialect mix is all central, though many of its people grew up elsewhere; the prior is uniform rather than population-weighted.
