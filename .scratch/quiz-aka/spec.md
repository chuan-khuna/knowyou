# Other Thai names in the quiz glossary

Status: ready-for-agent

## Problem Statement

A quiz option uses one Thai spelling of a name, usually the Thai manga's. A player who knows the character from a Thai TV dub or another edition may know them by a different Thai name (เกี๊ยวซ่า vs. a dub's name), and may miss a question they know the answer to.

## Solution

A glossary entry can list other Thai names for its label. The screen shows them in brackets after the label, as in `เกี๊ยวซ่า (<other name>)`, followed by the romaji, kanji and English lines as now. Dragon Ball's characters get entries where a page shows that another Thai name is in real use.

## User Stories

1. As a player, I want to see the other Thai names of a character beside the option, so that I recognise a character I know by a dub's name.
2. As a player, I want the same brackets in เฉลย and on prompt terms, so that the result reads the same way.
3. As a player, I want the romaji, kanji and English under a character's name, so that I can tell characters apart from their original names.
4. As a maintainer, I want the check to reject an empty `aka`, an `aka` equal to its label, and an `aka` that names another option in the same question, so that the brackets never make two options look alike.
5. As a maintainer, I want every `aka` backed by a page showing the name in use, so that the quiz doesn't invent names.

## Implementation Decisions

- `Gloss` gains an optional `aka: string[]`. `parseGlossary` rejects an `aka` that isn't a list of strings. `quizIssues` rejects empty names, a name equal to the label, repeated names, and, per question, any label or `aka` naming another option.
- The quiz screen shows `label (aka, aka)` with the brackets muted, on options, prompt terms and the right answer in เฉลย.
- Dragon Ball's glossary gains character entries. Each carries romaji, kanji and English, and an `aka` only when a page shows the other Thai name in use. Characters with no confirmed other name are not added.

## Assumptions

- Dragon Ball's characters, and Naruto's lands (asked for in chat). Prince of Tennis and Reborn can use `aka` later.
- The glossary has no source field. The sources for each `aka` are recorded in this spec's Comments, not in the JSON.
- Trivial spelling variants (a tone mark, spacing) don't count as another name.

## Testing Decisions

- Through the quiz module's public interface: `parseGlossary` reads and rejects `aka`; `quizIssues` reports each `aka` rule (prior art: `bank.test.ts`).
- Dragon Ball's `bank.test.ts` already requires `quizIssues` to be empty for the shipped content.

## Out of Scope

- Accepting typed answers in any spelling (the quiz is multiple choice).
- `aka` for Prince of Tennis and Reborn.

## Comments

- Naruto lands: แคว้นแห่งเหล็ก, ไฟ, น้ำ, ลม and สายฟ้า take the Thai Wikipedia names, such as "แคว้นเหล็ก ( 鉄の国 , เทะซึโนะคุนิ )", "แคว้นน้ำ ( 水の国 , มิซึโนะคุนิ )". Source: https://th.wikipedia.org/wiki/โลกของนินจาคาถาโอ้โฮเฮะ. แคว้นแห่งคลื่น was not found on the page, so it has no entry.
- Dragon Ball characters: 20 entries from a sourced research pass, each `aka` backed by a page quoting it. Main sources: Thai Wikipedia's รายชื่อตัวละครในดราก้อนบอล, ซง โกคู, ผู้เฒ่าเต่า and ดราก้อนบอล ซูเปอร์ (Thai dub episode titles); Pantip threads 31138754 (three old Thai manga editions, and a reply tabling Japanese, Chinese, English, the Channel 9 dub and pirate names), 31124798, 39671458 and 41885445; and the archived topicstock A9957618 (โงกุน in the Channel 9 dub). เจาซือ had no source as a name in use, so เกี๊ยวซ่า takes เจาสึ, เจ๋าซือ and จาโอส. ไคโอชิน keeps only มหาเทพไคโอชิน; the bare มหาเทพ and ชิน were dropped as too close to มหาเทพรุ่นที่ 15. Sourced but left out as minor spelling variants: ปีศาจวัว, ฟรีซเซอร์, เบจีต้า, ทรังค์, ปิลาฟ, ไซไบแมน, ซาบอน, อุป้า, มุไทโต, ราดิซ, กีนิว, บาบีดี้, คุริลิน.
- Dragon Ball trimmed (asked for in chat): only the best-known other name per character, mostly the Channel 9 dub's. Kept: โกคู (โงกุน), โกฮัง (โงฮัง), ปู่โกฮัง (ปู่โงฮัง), เกี๊ยวซ่า (เจาสึ), หยำฉา (ยามุชา), พิคโกโร่ (พิคโคโล่), ท่านไคโอ (ท่านจ้าวพิภพ), ฟรีเซอร์ (ฟรีซ่า). The other 12 character entries were removed rather than kept without an `aka`.
- Prince of Tennis moves (asked for in chat, 2026-11-26): ฮยาคุเร็น จิโทคุ โนะ คิวามิ (ผลของการฝึกตนนับร้อย), ไซกิ คัมปัตสึ โนะ คิวามิ (ผลของการระเบิดปัญญา), เท็นอิ มุโฮ โนะ คิวามิ (สภาวะไร้ที่ติ, ผลของการไร้ที่ติ), เสิร์ฟหายตัว (ลูกเสิร์ฟล่องหน). Source: the user; no page cited.
