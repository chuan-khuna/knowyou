# Spec: Province game v1

Status: ready-for-agent

Terms follow `GLOSSARY.md`. The foundation is `.scratch/foundation/spec.md`. Anime Age is the precedent for every shape not stated here: `docs/documents/anime-age-engine.md` and `src/games/anime-age/`.

## Problem Statement

Thai players want a game that guesses which province they come from by asking about the everyday things only locals know: how people at home talk, what they eat, and the traditions they grew up with. An earlier prototype (a user-supplied archive) leaned on geography: distance to the sea, the Mekong, Bangkok, a neighbouring country, an airport or BTS. The user found those questions too specific and too much about "what are you near". They want fewer of them, and more about culture, food and language.

## Solution

A playable game at `/province`, on the shared play screen. It asks one question at a time with a live confidence meter, then makes one guess: "คุณมาจากจังหวัด<ชื่อ>". The player says whether it's right. If it's wrong, they pick their real province from a list grouped by region. The result screen shows a dot map of Thailand coloured by the game's belief, the guess, the true province when given, the top few candidates, the answers that pointed hardest at the guess, and the answers list. The home picker lists Province as playable.

## User Stories

1. As a player, I want to start ทายจังหวัด from the home page, so that I can play it like Anime Age.
2. As a player, I want questions about how people at home talk, so that the game reads my dialect.
3. As a player, I want questions about the food I grew up with, so that answering feels familiar and fun.
4. As a player, I want questions about local traditions, festivals and temple-fair shows, so that the game reads my culture.
5. As a player, I want only a few questions about geography, so that the game doesn't feel like a map quiz.
6. As a player, I want every question to have "ไม่แน่ใจ" as the last option, so that I'm never forced to guess.
7. As a player, I want 4–6 options per question, each with one clear meaning, so that I can answer quickly.
8. As a player, I want some questions to list well-known local foods or traditions from a few likely provinces, so that the game can tell neighbours apart.
9. As a player, I want the game to stop once it is confident, or after a fixed maximum, so that a play doesn't drag on.
10. As a player, I want exactly one guess, so that the reveal feels like a bet.
11. As a player, I want to say whether the guess was right, so that I can react to the reveal.
12. As a player whose guess was wrong, I want to pick my real province from a list grouped by region, so that I can see how close the game got.
13. As a player, I want a map of Thailand's real province shapes beside the questions, where provinces the game has ruled out fade after every answer, so that I watch it narrow down on me.
14. As a player, I want the result to show the same map with the guess, my real province and the game's belief, so that I can see its reasoning at a glance.
15. As a player asked which neighbouring country is closest to my home, I want a map of Thailand with Myanmar, Laos, Cambodia and Malaysia labelled, so that I can answer from the picture.
16. As a player, I want to see the answers that pointed hardest at the guess, so that I understand why it guessed that province.
17. As a player, I want to see my answers list and play again, so that I can review and retry.
18. As a player who moved, I want the game to ask about the province I grew up in, so that the question has one answer.
19. As a question author, I want to write questions as facts about provinces (dialect mix, region, food and tradition tags), not as 77-row tables, so that the bank is reviewable.
20. As a maintainer, I want simulated-player and persona suites like Anime Age's, so that I know the engine and the bank work.
21. As a maintainer, I want the province engine to implement the shared engine contract, so that the play screen and back button work unchanged.
22. As a player, I want a play in progress to survive a page refresh, so that a reload doesn't throw away my answers. This uses the shared restore that Anime Age gets.
23. As a player, I want UI sounds with a mute toggle, so that the game feels alive and I can silence it. These are the same sounds as Anime Age.

## Implementation Decisions

- **Engine per game.** `src/games/province/` owns its engine, schema, data, bank and tests, behind one `index.ts`, with a boundaries test like Anime Age's. It implements the shared `Engine<V, X>` contract in `src/games/engine.ts` unchanged. Its play is an immutable value whose only state is the seed and the answer log.
- **Hidden value.** One of 77 provinces (the official six-region split: north 9, northeast 20, central 22, east 7, west 5, south 14). The prior is uniform, or gently population-weighted if population data is at hand. The guess is the posterior's top province. Confidence is that province's posterior mass. A hit is the exact province.
- **Province data.** Port the archive's 77 provinces (id, Thai name, region, capital lat/lng, dialect mix, terrain, coast) into typed facts. Add culture, food and language facts where the questions need them, such as a muslim share and Chinese-Thai and Khmer/Kuy communities. Treat the archive's code and comments as reference data only.
- **Question facts.** A question records facts that the bank derives into P(option | province). This is the same hybrid as Anime Age, with an override for odd cases. The main derivations:
  - **by dialect.** A per-dialect distribution weighted by the province's dialect mix. Dialects: กลาง, คำเมือง, อีสาน/ลาว, ใต้, เขมร/กูย, มลายู.
  - **by region.** A per-region distribution with optional per-province overrides.
  - **by tag.** An option is typical of the provinces carrying a tag (for example `boran-cha` or `buduu`), with a background probability for the rest.
  - **geography.** Terrain, coast distance, latitude for the cold season, and travel time to Bangkok.
- **Question mix** (the user's direction).
  - Language, about 8 or more: dialect words and phrases such as อร่อย, มะละกอ, ขนมจีน, ไม่, มาก, "ไปไหนมา", what you call your parents or friends.
  - Food, about 8 or more: everyday rice, kitchen staples, breakfast, local curries and dips, noodles, dessert, snacks.
  - Culture, about 6 or more: festivals, temple-fair shows, traditional dress, music, the house of worship you hear, local sports and pastimes.
  - Geography, at most 5: sea, mountains, the cold season, travel time to Bangkok, and the nearest neighbouring country (shown with the neighbours map, at the user's request). Drop the archive's Mekong, airport, metro and crop-landscape questions.
- **Pick questions.** These are built in play from the current front-runners' signature foods and traditions (ของกินขึ้นชื่อ, ประเพณี, ของฝาก), never landmarks or "near what". Prompt: "อันไหนเป็นของขึ้นชื่อหรือของกินที่คุ้นที่สุดแถวบ้านคุณ?" At most 4 per play, never two in a row. Options: 3–4 signatures plus "ไม่มีอันไหนเลย" plus "ไม่แน่ใจ".
  - A pick question built in play must still be determined by the play's seed and answer log, so plays stay reproducible and rewind still works.
  - The decision to build pick questions from province signatures follows the archive's working model.
- **Selection and stop.** Expected information gain with a seeded shortlist, as in Anime Age. Confidence threshold, minimum and maximum questions all live in one `PROVINCE_RULES` constant; start near the archive's values (min 12, max 22 to 25, confidence 0.95) and tune against the simulated suite.
- **Maps from GeoJSON.**
  - Source the boundaries from Natural Earth (public domain). Use admin-1 for the 77 Thai provinces and admin-0 for Myanmar, Laos, Cambodia and Malaysia. If Natural Earth lacks a province (such as Bueng Kan), say so and pick another openly licensed source, recording its licence.
  - Build the lever: a committed script under `scripts/` that downloads or reads the GeoJSON, simplifies it, projects it, and writes compact SVG path data keyed by province id to a generated module. The app never ships raw GeoJSON. Record the source URL and licence in the generated file's header and in a doc.
  - A test asserts that every province id has exactly one shape and every shape matches a province id.
- **Live map while playing.** Beside or above the question (above it on a phone, kept small), the province map shows every province. Provinces whose posterior has fallen below a threshold are deactivated: dimmed to the paper tone, no accent. The leading few are tinted by belief.
  - This needs per-game live data on an asking play. Extend the shared contract minimally and optionally: for example a game-typed `live` field on `AskingPlay` that the shared screen hands to a game-supplied render prop. Anime Age must compile and behave unchanged.
  - Fading uses opacity and colour only, with a reduced-motion fallback.
- **Question figures.** A question may name a figure, such as the neighbours map. The shared play screen renders it through a game-supplied renderer, so the screen never imports a game.
- **Result screen.**
  - The guess on the gold sheet.
  - The reveal: right, or wrong with a region-grouped province picker.
  - The GeoJSON province map tinted by final belief, with the guess and the true province outlined. It is a chart of real data, so it gets an `aria-label`.
  - The top 3 candidates with their probabilities.
  - The 2 answers that pointed hardest at the guess.
  - The answers list, play again, and the dev-only persona copy button.
- **UI.** Use the existing shared play screen, Hallmark tokens and classes (`stock`, `sheet`, `meter` and so on). There are no emoji icons, because the archive's emoji fail Hallmark gate 30a. Thai text only.

## Testing Decisions

- **One seam.** The province engine's public interface, exactly as the play screen uses it.
- **Bank validity.**
  - 77 provinces with unique ids and the official region counts.
  - Dialect mixes sum to 1.
  - Every derived row is a valid distribution with every entry above 0.
  - 4–6 options per question, with "ไม่แน่ใจ" last and unique labels.
  - Geography questions number 5 or fewer.
  - Every province has exactly one map shape.
  - Every province has at least 2 signatures.
- **Simulated players.** For each province, run seeded plays sampled from the derived rows, and report:
  - the exact-province hit rate
  - the top-3 rate
  - the right-region rate
  - the worst province
  - mean questions asked

  First measure a baseline, then set the asserted thresholds from it with a written justification. Thresholds are never loosened later to make a change pass.
- **Personas.** The same infrastructure as Anime Age, with one placeholder persona clearly marked as a placeholder.
- **Contract behaviour.** Reproducibility, immutability, numbering, rejection of an unknown key, and stopping when the bank runs out.

## Out of Scope

- University.
- The back button (still pending from Anime Age). It must keep working for province once it exists, which the contract guarantees.
- Data collection, sharing and a backend.
- Province facts from verified sources. Mark doubtful facts `unsure`, as Anime Age does.
