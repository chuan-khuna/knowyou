# Prince of Tennis quiz: question format for research

A brief for an agent that researches new questions for คุณรู้จัก Prince of Tennis ดีแค่ไหน. Return the questions as one JSON file in the shape below. A maintainer checks them and copies them into `src/games/prince-of-tennis/bank.ts` and `glosses.ts`. How the quiz runs is in [prince-of-tennis-quiz.md](prince-of-tennis-quiz.md).

## How the quiz uses a question

- A standard play asks 20 questions: 5 from each tier, easy first. The `all` mode asks every question in the bank.
- Each question shows a Thai prompt and four options: the answer and three decoys, shuffled.
- After the player answers, the screen shows right or wrong, the right answer, and the `note` if there is one.
- If an option is a Japanese technique name, or a Thai translation of one, the screen shows its romaji, kanji and English name under it. That data comes from the glossary.

## Output file

Return one JSON object with two keys: `questions` and `glossary`.

```json
{
  "questions": [
    {
      "id": "fuji-tsubame-gaeshi",
      "tier": "hard",
      "prompt": "เคาน์เตอร์ของฟูจิที่ทำให้ลูกกลิ้งไปกับพื้นโดยไม่เด้ง ชื่ออะไร?",
      "answer": "นางแอ่นหวนกลับ",
      "decoys": ["พิฆาตหมีสีน้ำตาล", "ปลาวาฬเผือก", "ตบแมลงเม่า"],
      "note": "สึบาเมะ กาเอชิ เคาน์เตอร์แรกของทริปเปิลเคาน์เตอร์",
      "source": "https://princeoftennis.fandom.com/wiki/Triple_Counters",
      "evidence": "Tsubame Gaeshi ... the ball rolls along the ground without bouncing."
    }
  ],
  "glossary": [
    { "th": "นางแอ่นหวนกลับ", "en": "Swallow Return", "romanji": "Tsubame Gaeshi", "jp": "燕返し" }
  ]
}
```

### Question fields

| Field | Required | Rule |
| --- | --- | --- |
| `id` | yes | Lowercase kebab-case, `[a-z0-9-]`, about 2 to 4 words: `<who or what>-<topic>`, such as `kaido-snake`. Must not match an id in the bank (see [Existing ids](#existing-ids)). |
| `tier` | yes | `easy`, `medium`, `hard` or `very-hard`. See [Tiers](#tiers). |
| `prompt` | yes | Thai. One question, ending with `?`. |
| `answer` | yes | Thai. The right option's exact label. |
| `decoys` | yes | Exactly 3 Thai labels. All four options must be different after trimming spaces. |
| `note` | no | Thai. One line shown after the answer. Leave the field out instead of writing an empty string. |
| `source` | yes | An `https://` page that confirms the answer. Prefer the Prince of Tennis wiki (`https://princeoftennis.fandom.com/wiki/...`), then Wikipedia. |
| `evidence` | yes | A short quote from `source`, in its own language, that confirms the answer. For review only; it does not go into the bank. |

### Glossary entries

`glossary` is an array. Add one entry when an option (answer or decoy) is a Japanese technique name, or a Thai translation of one.

```json
{
  "th": "อาณาจักรน้ำแข็ง",
  "en": "Ice World",
  "romanji": "Kōri no Sekai",
  "jp": "氷の世界"
}
```

| Field | Rule |
| --- | --- |
| `th` | The option's exact Thai label, character for character. One entry covers that label in every question, as an answer or a decoy. |
| `en` | The English name the wiki uses. |
| `romanji` | Hepburn romanisation, with macrons (`Kōri no Sekai`, `Hadōkyū`). |
| `jp` | The original Japanese, as the series writes it (kanji, kana or both). |

- Give each `th` once in the array.
- Do not repeat an entry that is already in [Existing glossary](#existing-glossary). Reuse its `th` label as written.
- Do not add an entry for a label that no question uses.
- Do not add entries for player names, school names or plain English move names (ทวิสต์เสิร์ฟ, ดั้งค์สแมช).

## Content rules

1. **Scope.** Use the manga, the TV anime and the National Tournament OVAs, up to the end of the National Tournament. Do not use *New Prince of Tennis*, the U-17 camp, films, musicals or games.
2. **Topics.** Ask only about moves and special moves, schools, team roles, pairs, nicknames, and story events (who played whom, who won, what happened in a match).
3. **Not allowed.** Birthdays, heights, numbers, scores, and personal trivia such as family, pets, hobbies and food.
4. **One right answer.** The source must confirm the answer. If the manga and anime differ, use a question where they agree, or say which one in the prompt.
5. **No give-aways.** A prompt or note must not name the answer to another question in the bank or in your file. For example, do not name an opponent in a note when another question asks who that opponent was.
6. **No near-duplicates.** Do not ask a fact that an existing question already asks in other words.
7. **Plausible decoys.** Each decoy must be the same kind of thing as the answer: a player for a player, a school for a school, a move for a move. A decoy must be clearly wrong by the source. Do not use a decoy that is also true; for example, do not list a player as a decoy for "who used move X" if that player also used X.
8. **Negative questions.** "ใครไม่ได้อยู่โรงเรียนริคไค?" is allowed. Put the reason in `note` (`ชิชิโดะอยู่เฮียวเท`).

## Tiers

The bank needs at least 15 questions per tier. It has about 30 now. Aim for a balanced spread.

| Tier | Thai label | Who can answer | Examples in the bank |
| --- | --- | --- | --- |
| `easy` | ง่าย | Anyone who watched the first season | Ryoma's school, Seigaku's captain, the Golden Pair, Momo's Dunk Smash |
| `medium` | ปานกลาง | A fan who finished the anime | Rikkai's Big Three, Akutsu quits tennis, Inui's data tennis, Tezuka's Zone |
| `hard` | ยาก | A fan who remembers match details | Fuji's triple counters by name, Muga no Kyōchi, the Kanto final pairings |
| `very-hard` | ยากมาก | A close reader of the manga and OVAs | The three Muga gates, Shiraishi's Entaku Shot, why Hyotei went to the Nationals |

## Thai spelling

Write names the way the bank already writes them: family name first, then given name, with a space. Use these spellings. For a name that is not here, use the spelling most Thai fans use and keep it the same in every question.

**Schools.** เซชุน (เซงาคุ), เฮียวเท, ริคไค, ฟุโดมิเนะ, ยามาบุกิ, เซนต์รูดอล์ฟ, รคคาคุ, ชิเทนโฮจิ, ฮิงะ, ชิชิงาคุ

**Seigaku.** เอจิเซ็น เรียวมะ, เทะสึกะ คุนิมิสึ, โออิชิ ชูอิจิโร่, ฟูจิ ชูสึเกะ, คิคุมารุ เอจิ, อินูอิ ซาดาฮารุ, คาวามูระ ทาคาชิ, โมโมชิโระ ทาเคชิ, ไคโด คาโอรุ, ริวซากิ ซูมิเระ (coach)

**Hyotei.** อาโตเบะ เคย์โกะ, คาบาจิ มุเนฮิโระ, โอชิทาริ ยูชิ, มุคาฮิ งาคุโตะ, ชิชิโดะ เรียว, โอโทริ โชทาโร่, ฮิโยชิ วาคาชิ, อาคุตางาวะ จิโร่, ซาคากิ ทาโร่ (coach)

**Rikkai.** ยูคิมูระ เซอิจิ, ซานาดะ เก็นอิจิโร่, ยานางิ เร็นจิ, นิโอ มาซาฮารุ, ยางิว ฮิโรชิ, มารุอิ บุนตะ, แจ็คคัล คุวาฮาระ, คิริฮาระ อาคายะ

**Others.** ทาจิบานะ คิปเป, คามิโอะ อากิระ, อิบุ ชินจิ, อิชิดะ เท็ตสึ, ฟูจิ ยูตะ, มิสึกิ ฮาจิเมะ, อาคุสึ จิน, เซนโงคุ คิโยสุมิ, ชิราอิชิ คุราโนะสุเกะ, โทยามะ คินทาโร่, โอชิทาริ เคนยะ, จิโทเสะ เซ็นริ, อิชิดะ งิน, วาตานาเบะ โอซามุ, คิเทะ เอชิโร่, คาอิ ยูจิโร่, ฮิราโคบะ ริน, ทานิชิ เคย์

**Pairs.** Join two players with `กับ`: `นิโอ มาซาฮารุ กับ ยางิว ฮิโรชิ`.

**Technique names.** Use the Thai translation fans know (นางแอ่นหวนกลับ, อาณาจักรน้ำแข็ง) or a Thai transliteration (ฮาโดคิว, ชุคุจิโฮ). English-named moves keep their English sound in Thai script (ทวิสต์เสิร์ฟ, ดั้งค์สแมช, เลเซอร์บีม). Add the glossary entry either way when the move has a Japanese name.

## Existing ids

A snapshot of the bank on 2026-11-26 (120 questions). If you can read the repository, `src/games/prince-of-tennis/bank.ts` is the source of truth.

```text
ryoma-school ryoma-left-handed ryoma-goal-father ryoma-twist-serve seigaku-coach seigaku-captain
hyotei-captain rikkai-defending-champion golden-pair momo-dunk-smash kaido-snake kawamura-burning
inui-data-tennis eiji-acrobatic fuji-triple-counter ryoma-drive-series tezuka-left-handed sanada-school
seigaku-vice-captain niou-partner shishido-partner momo-kaido-rivals ryoma-from-america ryoma-first-year
seigaku-tensai not-rikkai not-seigaku not-fuji-counter kabaji-usu kikumaru-beam rikkai-vice-captain
yukimura-child-of-god rikkai-big-three hyotei-tensai never-lost-to-ryoma never-played-ryoma akutsu-quits
kanto-ryoma-hiyoshi rikkai-captain fudomine-captain yuta-school akutsu-school kintaro-school
oishi-moon-volley momo-jack-knife kawamura-hadokyu tezuka-zone ibu-spot kamio-speed ryoma-ibu-eye
tezuka-kyushu kanto-first-round kanto-final-opponent oishi-territory ryoma-split-step tezuka-zero-shiki
yanagi-data-tennis sengoku-school mizuki-school shitenhoji-captain atobe-tannhauser inui-waterfall
kintaro-mountain-storm hiyoshi-enbu higa-shukuchiho tezuka-beats-ryoma kai-oji nationals-unbeaten
fuji-tsubame-gaeshi fuji-higuma-otoshi fuji-hakugei-wind samurai-drive muga-no-kyochi sanada-furinkazan
yukimura-senses niou-illusion kirihara-devil kabaji-copy ootori-scud-serve kanto-final-ryoma-sanada
tezuka-atobe-kanto yukimura-hospital atobe-shaved higa-okinawa nationals-semi-opponent nationals-winner
ryoma-beats-yukimura kaido-boomerang-snake marui-tightrope yagyu-laser-beam nationals-before-hyotei
fuji-kagero fuji-hecatoncheires sanada-in-rai yanagi-kamaitachi golden-pair-synchro kaido-lost-both-finals
oishi-no-singles shiraishi-entaku tezuka-phantom tezuka-hyakuren chitose-saiki-kanpatsu kyushu-shishigaku
tachibana-abare-dama yuta-twist-spin-shot atobe-rondo atobe-ice-world oshitari-higuma mukahi-acrobatic
shishido-haircut kanto-final-fuji-kirihara tezuka-sanada-final fuji-shiraishi kawamura-gin
ryoma-kintaro-draw ryoma-ranking-inui inui-yanagi-childhood higa-captain kirihara-knuckle-serve
hyotei-host-wildcard
```

## Existing glossary

A snapshot of `GLOSSES` in `src/games/prince-of-tennis/glosses.ts` on 2026-11-26 (24 entries), in the output shape. Reuse these `th` labels as written, and do not send them again. Use them as the model for new entries.

```json
[
  { "th": "สภาวะไร้ตัวตน", "en": "State of Selflessness", "romanji": "Muga no Kyōchi", "jp": "無我の境地" },
  { "th": "ฮยาคุเร็น จิโทคุ โนะ คิวามิ", "en": "Pinnacle of Hard Work", "romanji": "Hyakuren Jitoku no Kiwami", "jp": "百錬自得の極み" },
  { "th": "ไซกิ คัมปัตสึ โนะ คิวามิ", "en": "Pinnacle of Great Wisdom", "romanji": "Saiki Kanpatsu no Kiwami", "jp": "才気煥発の極み" },
  { "th": "เท็นอิ มุโฮ โนะ คิวามิ", "en": "Pinnacle of Perfection", "romanji": "Ten'i Muhō no Kiwami", "jp": "天衣無縫の極み" },
  { "th": "ฟู ริน คา ซัน", "en": "Wind, Forest, Fire, Mountain", "romanji": "Fūrinkazan", "jp": "風林火山" },
  { "th": "นางแอ่นหวนกลับ", "en": "Swallow Return", "romanji": "Tsubame Gaeshi", "jp": "燕返し" },
  { "th": "พิฆาตหมีสีน้ำตาล", "en": "Brown Bear Drop", "romanji": "Higuma Otoshi", "jp": "羆落とし" },
  { "th": "ปลาวาฬเผือก", "en": "White Whale", "romanji": "Hakugei", "jp": "白鯨" },
  { "th": "ตบแมลงเม่า", "en": "Mayfly Envelopment", "romanji": "Kagerō Tsutsumi", "jp": "蜉蝣包み" },
  { "th": "บทเพลงแห่งหายนะ", "en": "Rondo Towards Destruction", "romanji": "Hametsu e no Rondo", "jp": "破滅への輪舞曲" },
  { "th": "อาณาจักรน้ำแข็ง", "en": "Ice World", "romanji": "Kōri no Sekai", "jp": "氷の世界" },
  { "th": "อาณาเขตของโออิชิ", "en": "Ōishi's Territory", "romanji": "Ōishi no Ryōiki", "jp": "大石の領域" },
  { "th": "ฮาโดคิว", "en": "Wave-Motion Ball", "romanji": "Hadōkyū", "jp": "波動球" },
  { "th": "อาบาเระดามะ", "en": "Wild Ball", "romanji": "Abare Dama", "jp": "暴れ球" },
  { "th": "ไต่เชือก (สึนะวาตาริ)", "en": "Tightrope Walking", "romanji": "Tsunawatari", "jp": "綱渡り" },
  { "th": "ซีโร่ชิกิ ดร็อปช็อต", "en": "Zero-Style Drop Shot", "romanji": "Zero-Shiki Drop Shot", "jp": "零式ドロップショット" },
  { "th": "ซูเปอร์อุลตร้าเกรทดีลิเชียส ไดชาริน ยามะอาราชิ", "en": "Super Ultra Great Delicious Mountain Storm", "romanji": "Chō Urutora Gurēto Derishasu Daisharin Yama Arashi", "jp": "超ウルトラグレートデリシャス大車輪山嵐" },
  { "th": "เอ็นบุเทนนิส", "en": "Enbu (Martial Demonstration) Tennis", "romanji": "Enbu Tenisu", "jp": "演武テニス" },
  { "th": "ชุคุจิโฮ", "en": "Ground-Shrinking Method", "romanji": "Shukuchihō", "jp": "縮地法" },
  { "th": "ผู้เฝ้าประตูเฮคาตอนไคร์", "en": "Gatekeeper of Hecatoncheires", "romanji": "Hekatonkeiru no Monban", "jp": "百腕巨人の門番" },
  { "th": "เงา (อิน) กับ สายฟ้า (ไร)", "en": "Shadow, Lightning", "romanji": "In, Rai", "jp": "陰・雷" },
  { "th": "คามาอิทาจิ", "en": "Wind Blade", "romanji": "Kamaitachi", "jp": "かまいたち" },
  { "th": "ฮาบุ", "en": "Habu (Pit Viper)", "romanji": "Habu", "jp": "飯匙倩" },
  { "th": "เอ็นทาคุช็อต", "en": "Round Table Shot", "romanji": "Entaku Shotto", "jp": "円卓ショット" }
]
```

## Before you hand it over

1. Check that the file is valid JSON.
2. Check that every `id` is new and appears once.
3. Check that every question has 3 decoys and 4 distinct options.
4. Open each `source` and confirm that `evidence` is on the page.
5. Check that every Japanese technique label has a glossary entry, and that every glossary `th` is an option in a question.
6. Check that every glossary entry has all four fields: `th`, `en`, `romanji`, `jp`.
7. Read every prompt and note again, and remove any name that answers another question.

## Importing (for the maintainer)

1. Drop `evidence` and copy each question into `bank.ts` under its `id`.
2. Copy each glossary entry into `GLOSSES` in `glosses.ts` as `"<th>": g(romanji, jp, en)`. The code names the fields `romaji`, `kanji` and `english`.
3. Run `bun test src/games/prince-of-tennis`.
4. Update the counts, the id snapshot and the glossary snapshot in this document.
