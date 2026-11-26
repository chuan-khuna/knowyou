# KnowYou

A family of guessing games that ask questions until they are confident, then guess one hidden fact about the player once: their province, their university, or their age from the anime they watched.

## Language

### Games

**Game**:
One guessing game, defined by the hidden fact it guesses and its question bank. The three games are Province, University and Anime Age.
_Avoid_: Mode, quiz

**Quiz**:
A set of questions about one title that each have one right answer, ending in a score and the right answers. It guesses nothing about the player, so it is not a game. The titles are Dragon Ball, Naruto, Prince of Tennis and Reborn.
_Avoid_: Game, test, trivia game

**Hidden value**:
The fact a game guesses about the player: one province, one university, or one age.
_Avoid_: Target, answer, label

### Questions

**Question**:
One prompt shown to the player, with a fixed set of answer options. Every answer shifts the game's belief about the hidden value.
_Avoid_: Item, card

**Pick question**:
A question that names a few things and asks which one the player knows. In Anime Age it names three titles from different eras and asks which one the player watched or met at a stage of life, such as "ตอนประถม คุณดูเรื่องไหนบ่อยที่สุด?". In Province and University it names the front-runners' signatures, is built during the play, and is identified by those signatures. Its answer probabilities come from the named titles', provinces' or universities' own facts.
_Avoid_: Multiple choice, which-one question

**Signature**:
Something a local recognises as their own. For a province it is a food, tradition or souvenir, such as ข้าวสังข์หยด for Phatthalung, never a landmark. For a university it is a tradition, campus place, food or song a student there would know, such as รับน้องขึ้นดอย for Chiang Mai University. Pick questions name signatures.
_Avoid_: Landmark, specialty, OTOP

**Question bank**:
All the questions a game can ask.
_Avoid_: Pool, dataset

**Question facts**:
What a question records about the world, such as when an anime first aired in Thailand and who it was for, or which provinces an answer is typical of. The game derives its answer probabilities from these facts.
_Avoid_: Metadata, params

**Override**:
Answer probabilities written out explicitly for one question, used in place of the ones derived from its question facts.
_Avoid_: Manual weights, patch

### Playing

**Play**:
One run of a game by one player, from the first question to the reveal.
_Avoid_: Session, round, attempt

**Confidence**:
How sure the game is of its current best guess during a play, shown to the player as a percentage.
_Avoid_: Certainty, score, probability

**Guess**:
The single hidden value the game commits to when it stops asking. Each play has exactly one guess.
_Avoid_: Prediction, answer, result

**Reveal**:
The moment the game shows its guess and the player says whether it is right.
_Avoid_: Result, verdict

**Live map**:
The Province map beside each question. Provinces the game has ruled out fade to the paper tone, the rest are tinted by belief, and Thailand's neighbours sit around it as context.
_Avoid_: Heatmap, progress map

**Ruled out**:
A province whose belief has fallen below 1% of the leader's. It fades on the live map, but a later answer can still bring it back.
_Avoid_: Eliminated, excluded

**Saved play**:
A play kept in the browser so a refresh doesn't lose it: its seed, its answer keys and the reveal. It is kept until the player starts again.
_Avoid_: Session, save game

**Seed code**:
A quiz play's seed written as up to 6 letters or digits, shown on the result as รหัสชุดคำถาม. The same seed code and count give the same quiz play.
_Avoid_: Room code, game ID, PIN

**Memory strata**:
The Anime Age result view: era bands showing how much of each era's anime the player knew.
_Avoid_: Timeline, history chart

### Checking guesses

**Persona**:
A real person's recorded answers to one game's questions, together with their true hidden value. It is the ground truth for whether the question bank works.
_Avoid_: Fixture, test user, sample

**Simulated player**:
A made-up player whose answers are drawn from the game's own answer probabilities for a chosen hidden value. It checks the guessing works as designed, not that the question bank matches real people.
_Avoid_: Bot, fake player
