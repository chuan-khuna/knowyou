# Spec: Split the home page into games and quizzes

Status: ready-for-agent

Terms follow `GLOSSARY.md`: a **Game** guesses a hidden value about the player, and a **Quiz** asks about one title and ends in a score.

## Problem Statement

The home page lists the three games and the two quizzes as one list in href order, so a quiz sits between two games. The user asked for them to be separate: "ตอนต้นเกม แยกหมวด quiz vs know you". A player should see at a glance which cards guess something about them and which test what they know.

## Solution

The home page shows two sections. ทายตัวคุณ lists the games: Anime Age, Province and University. ควิซ lists the quizzes: Naruto and Prince of Tennis. Each section has a heading and one line saying what its cards do. The cards look and behave as before.

## User Stories

1. As a player, I want the games and the quizzes in separate sections, so that I know what kind of play I am starting.
2. As a player, I want each section to say in one line what its cards do, so that I can choose without opening one.

## Implementation Decisions

- `src/app/page.tsx` holds two lists, `GAMES` and `QUIZZES`, each in href order, and renders one section per list with an `h2` and a line.
- The page headline stays: ถามจนกว่าจะมั่นใจ แล้วทายครั้งเดียว.
- Section copy:
  - ทายตัวคุณ: "เกมจะถามไปเรื่อย ๆ จนมั่นใจ แล้วทายเรื่องของคุณครั้งเดียว"
  - ควิซ: "ตอบคำถามเรื่องที่คุณชอบ แล้วดูว่าคุณรู้จักดีแค่ไหน"
- The `Quiz` glossary entry no longer says a quiz shows right or wrong after each answer, which stopped being true with `.scratch/quiz-no-reveal/spec.md`.

## Testing Decisions

- No module behaviour changes. In the running app, the home page shows the two sections with the right cards, and each card still opens its page.

## Out of Scope

- New cards, card styles or a different order inside a section.

## Assumptions

Taken without asking, per `CLAUDE.md`. Veto any of these by editing this list.

- The games come first, because KnowYou is named for them.
- The headings are Thai, like the rest of the page: ทายตัวคุณ and ควิซ.
- The headline stays as it is.
