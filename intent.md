I want to build a game like this https://kepigame.com/games/nenrei.html

but for
- ทายจังหวัดที่คุณอยู่ (ประเทศไทย)
- ทายมหาวิทยาลัยของคุณ
- ทายอายุ จากอนิเมะที่คุณดู

---

## Research: how nenrei (あなたの年齢を当てます) works

Sources read: the game page, kepigame.com/guide/nenrei.html, and the 2026-11-23 blog post. The game's JS and data were **not** visible to a text fetch. The algorithm below is the author's own description from the guide, not verified code.

### Concept
- It guesses your exact age (6–85) from what you remember of past fads and school/home life.
- It keeps asking until it is confident, then guesses once: 「あなたは〇〇歳です。」 A guess within ±1 year counts as a hit.
- Japanese players get Japanese fads. The 9 other languages, Thai included, get worldwide fads.

### Flow
1. **Start**: title, the rule "ask until sure, guess only once", a plea to answer 知らない/わからない honestly, and a challenger counter.
2. **Questions**: a Q number and a live **確信度 (confidence %)** meter. You tap an answer (number keys work on PC). There is an occasional bonus question that is not used for the result.
3. **Reveal**: the age, then 当たり / ちがう. If wrong, an optional "how old are you really?" stepper.
4. **Result**: the age, then 「記憶の地層」 (memory strata): six era bands from the 2020s back to the ≤1970s, each sized by how much you knew, with sample items. Then 「決め手」, the single answer that narrowed it most. Then a global hit rate (shown after 100+ reveals) and a "view my answers" list.
5. **Share**: a generated image of the verdict and strata, with share / save / copy buttons.

### Questions
- About 650 questions in the bank (Japanese). Each play asks 12–45, usually about 30, with at least 12.
- **Fads** (games, TV, songs, words, food, films, sports, manga) use a 4-level scale: よく見てた / 見たことある / 名前だけ知ってる / 知らない. The wording changes by category. For films it is 映画館で見た vs テレビや配信で見た.
- **School and life** questions ask what something was like back then, e.g. Saturday classes, classroom AC, name tags, home phone, the face on banknotes. わからない is always an option.
- **Quiz** questions have 4 choices. No correct answer is shown, because the choice is only an age signal.
- Example: 「子どものころ、JRの電車のことを何と呼んでいた？」

### Algorithm (author's description)
- For every age from 6 to 85 it stores P(answer | age). Each answer updates a probability distribution over ages, which is Bayesian narrowing in effect. Confidence is the probability of the single most likely age.
- **Question choice**: it starts with questions that split ages into about 6-year bands. Once the likely range is about 14 years wide, it switches to 1-year-resolution questions.
- **Stop rule**: confidence > 88%, or no remaining question can narrow it further.
- **Genre fallback**: genres that get many 知らない answers are demoted. After 3 of them, one fixed question is asked (「子どものころ、いちばんよくしていた遊びは？」).
- **Backtrack**: if an answer contradicts the current belief, it goes back to broad questions, at most 2 times per play.
- It accounts for parents knowing kid-targeted items and for older people knowing "old things".
- **Learning**: when players reveal their true age, it counts (age, answer) pairs. It uses only first plays, filters out random or implausible answers, and starts adjusting weights after enough data. It stores aggregate counts only.

### Tech (partly inferred)
- Static HTML pages with JS. The question bank and weights are probably JSON/JS.
- A small backend for the challenger counter, the hit-rate stats and the aggregate learning counts.

### Mapping to our three games
| | Hidden variable | Prior / range | Answer signal |
|---|---|---|---|
| ทายจังหวัด | 1 of 77 provinces | uniform or population-weighted | local food, dialect words, chains/brands, weather, landmarks, local news and celebrities |
| ทายมหาวิทยาลัย | 1 of N universities | enrollment-weighted | campus slang, traditions (รับน้อง, songs, colors), canteens, nearby places, faculty culture |
| ทายอายุจากอนิเมะ | age (e.g. 8–60) | Thai age distribution | familiarity with anime by airing year and Thai TV broadcast era (Ch.9, iTV, streaming) |

The same engine works for all three: a categorical posterior over the hidden variable, a P(answer | value) table per question, next question chosen by expected information gain, and a stop at a confidence threshold. Age has an ordered axis, so it can smooth across neighbouring ages. Province and university are unordered categories, though province could use region and neighbour structure.
