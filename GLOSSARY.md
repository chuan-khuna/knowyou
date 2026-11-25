# Pinpoint

A family of guessing games that ask questions until they are confident, then guess one hidden fact about the player once: their province, their university, or their age from the anime they watched.

## Language

### Games

**Game**:
One guessing game, defined by the hidden fact it guesses and its question bank. The three games are Province, University and Anime Age.
_Avoid_: Mode, quiz

**Hidden value**:
The fact a game guesses about the player: one province, one university, or one age.
_Avoid_: Target, answer, label

### Questions

**Question**:
One prompt shown to the player, with a fixed set of answer options. Every answer shifts the game's belief about the hidden value.
_Avoid_: Item, card

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
