# Prince of Tennis quiz: question format for research

A brief for an agent that researches new questions for คุณรู้จัก Prince of Tennis ดีแค่ไหน. Return the questions as one JSON file in the shape below. A maintainer checks them and appends them to `src/games/prince-of-tennis/questions.json` and `glossary.json`. How the quiz runs is in [quiz.md](quiz.md).

## How the quiz uses a question

- The player picks how many questions to play, from 5 to the whole bank; 20 is the default. The count is dealt evenly over the tiers, easy first.
- Each question shows a Thai prompt and four options: the answer and three decoys, shuffled.
- With the เฉลยทุกข้อ switch on, each answer shows right or wrong, the right answer and the `note` at once. With it off, nothing shows until the end. Either way the result lists every question with its right answer, the player's answer, and the `note` if there is one.
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
  "glossary": {
    "นางแอ่นหวนกลับ": { "romaji": "Tsubame Gaeshi", "kanji": "燕返し", "english": "Swallow Return" }
  }
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
| `note` | no | Thai. One line shown with the answer. Leave the field out instead of writing an empty string. |
| `source` | yes | An `https://` page that confirms the answer. Prefer the Prince of Tennis wiki (`https://princeoftennis.fandom.com/wiki/...`), then Wikipedia. |
| `evidence` | yes | A short quote from `source`, in its own language, that confirms the answer. It stays in the bank for review; the quiz never shows it. |

### Glossary entries

`glossary` is an object keyed by the option's exact Thai label. Add one entry when an option (answer or decoy) is a Japanese technique name, or a Thai translation of one.

```json
"อาณาจักรน้ำแข็ง": { "romaji": "Kōri no Sekai", "kanji": "氷の世界", "english": "Ice World" }
```

| Field | Rule |
| --- | --- |
| key | The option's exact Thai label, character for character. One entry covers that label in every question, as an answer or a decoy. |
| `romaji` | Hepburn romanisation, with macrons (`Kōri no Sekai`, `Hadōkyū`). |
| `kanji` | The original Japanese, as the series writes it (kanji, kana or both). |
| `english` | The English name the wiki uses. |

- Do not repeat an entry that is already in [Existing glossary](#existing-glossary). Reuse its label as written.
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

The bank needs at least 15 questions per tier. On 2026-11-26 it has 55 easy, 95 medium, 113 hard and 64 very hard. Aim for a balanced spread.

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

**Pairs.** Join two players with `กับ`: `นิโอ มาซาฮารุ กับ ยางิว ฮิโรชิ`. The Ōishi–Kikumaru pair is คู่ทองคำ, not โกลเด้นแพร์.

**Terms.** สเน็ค (บูมเมอแรงสเน็ค), ทันฮอยเซอร์เสิร์ฟ, นัคเคิลเสิร์ฟ, เสิร์ฟล่องหน, เทนนิสข้อมูล (not ดาต้าเทนนิส), อินไซต์.

**Technique names.** Use the Thai translation fans know (นางแอ่นหวนกลับ, อาณาจักรน้ำแข็ง, ลูกถล่มปฐพี, ท่าย่นระยะทาง, เทพบังตา, จั๊กจั่นลอกคราบ) or a Thai transliteration (คามาอิทาจิ). English-named moves keep their English sound in Thai script (ทวิสต์เสิร์ฟ, ดั้งค์สแมช, เลเซอร์บีม). Add the glossary entry either way when the move has a Japanese name.

## Existing ids

A snapshot of the bank on 2026-11-26 (327 questions). If you can read the repository, `src/games/prince-of-tennis/questions.json` is the source of truth.

```text
ryoma-school ryoma-left-handed ryoma-goal-father ryoma-twist-serve seigaku-coach seigaku-captain
hyotei-captain rikkai-defending-champion golden-pair momo-dunk-smash kaido-snake kawamura-burning
inui-data-tennis eiji-acrobatic fuji-triple-counter ryoma-drive-series tezuka-left-handed
sanada-school seigaku-vice-captain niou-partner shishido-partner momo-kaido-rivals
ryoma-from-america ryoma-first-year seigaku-tensai not-rikkai not-seigaku not-fuji-counter
kabaji-usu kikumaru-beam rikkai-vice-captain yukimura-child-of-god rikkai-big-three hyotei-tensai
never-lost-to-ryoma never-played-ryoma akutsu-quits kanto-ryoma-hiyoshi rikkai-captain
fudomine-captain yuta-school akutsu-school kintaro-school oishi-moon-volley momo-jack-knife
kawamura-hadokyu tezuka-zone ibu-spot kamio-speed ryoma-ibu-eye tezuka-kyushu kanto-first-round
kanto-final-opponent oishi-territory ryoma-split-step tezuka-zero-shiki yanagi-data-tennis
sengoku-school mizuki-school shitenhoji-captain atobe-tannhauser inui-waterfall
kintaro-mountain-storm hiyoshi-enbu higa-shukuchiho tezuka-beats-ryoma kai-oji nationals-unbeaten
fuji-tsubame-gaeshi fuji-higuma-otoshi fuji-hakugei-wind samurai-drive muga-no-kyochi
sanada-furinkazan yukimura-senses niou-illusion kirihara-devil kabaji-copy ootori-scud-serve
kanto-final-ryoma-sanada tezuka-atobe-kanto yukimura-hospital atobe-shaved higa-okinawa
nationals-semi-opponent nationals-winner ryoma-beats-yukimura kaido-boomerang-snake marui-tightrope
yagyu-laser-beam nationals-before-hyotei fuji-kagero fuji-hecatoncheires sanada-in-rai
yanagi-kamaitachi golden-pair-synchro kaido-lost-both-finals oishi-no-singles shiraishi-entaku
tezuka-phantom tezuka-hyakuren chitose-saiki-kanpatsu kyushu-shishigaku tachibana-abare-dama
yuta-twist-spin-shot atobe-rondo atobe-ice-world oshitari-higuma mukahi-acrobatic shishido-haircut
kanto-final-fuji-kirihara tezuka-sanada-final fuji-shiraishi kawamura-gin ryoma-kintaro-draw
ryoma-ranking-inui inui-yanagi-childhood higa-captain kirihara-knuckle-serve hyotei-host-wildcard
district-final-opponent gyokurin-d2-pair gyokurin-split-court fudomine-d2-forfeit
fudomine-ishida-hadokyu kaido-district-opponent kaido-kamio-winner-how ryoma-ten-minutes
district-celebration rudolph-d2-pair rudolph-d2-knockout golden-pair-rudolph-loss oishi-plays-alone
ryoma-yuta-winning-move yuta-lefty-killer mizuki-taught-twist-spin fuji-mizuki-five-games
fudomine-beat-hyotei tokyo-final-opponent golden-pair-jimmies momo-sengoku-winner momo-cramp-win
ryoma-akutsu-opening fuji-kawamura-yamabuki kanto-oishi-absent kanto-eiji-partner
kanto-hyotei-d2-result kanto-inui-kaido-opponents kanto-kawamura-kabaji kanto-fuji-jiro-motivation
kanto-fuji-jiro-result tezuka-atobe-ended-in tezuka-atobe-target kanto-semis-opponent
kanto-momo-kawamura-rokkaku kanto-fuji-eiji-pair saeki-seals-acrobatics ryoma-aoi-anime-overnight
kaido-aoi-manga rikkai-kanto-semis-opponent kirihara-injures-tachibana sanada-yanagi-pair-kanto
kanto-final-golden-pair-loss kanto-final-momo-kaido-loss kanto-final-inui-yanagi-winner
kanto-final-postponed kanto-final-yukimura-news kirihara-ryoma-street-match hyotei-qf-s3
hyotei-qf-d2 hyotei-qf-golden-pair-result ryoma-atobe-qf-zone nationals-r2-tanishi
ryoma-tanishi-feint eiji-first-singles higa-d2-fuji-partner higa-attacks-ryuzaki kite-pebbles
shitenhoji-sf-d2 shitenhoji-sf-d2-winner shitenhoji-d1-partners-step-aside shitenhoji-qf-opponent
tachibana-chitose-result ibu-kintaro rikkai-nationals-sf-opponent rikkai-lost-on-purpose
kirihara-krauser final-d2-forfeit final-kaido-laser final-niou-illusions final-fuji-niou-winner
final-golden-pair-opponent kintaro-stalls-yukimura ryoma-memory-helpers sanada-tezuka-net-cord
tezuka-first-doubles hyotei-r2-nationals fuji-disappearing-serve fuji-hoo-gaeshi fuji-kirin-otoshi
fuji-hakuryu fuji-hoshi-hanabi kawamura-dash-hadokyu kawamura-dash-limit two-handed-hadokyu-benefit
hadokyu-creator final-hadokyu-inspiration kaido-tornado-snake kaido-reverse-snake
kaido-snake-weakness ryoma-cool-drive ryoma-drive-c ryoma-drive-a ryoma-cyclone-smash
ryoma-new-move-practice ryoma-sky-inversion ryoma-nitoryu sanada-ka sanada-fu sanada-rin sanada-zan
sanada-rai-legs sanada-invisible-serve atobe-insight kai-viking-horn hirakoba-habu tanishi-big-bang
sengoku-koho eiji-seal-step eiji-bazooka golden-pair-australian golden-pair-i-formation
ah-un-real-pair yanagi-utsusemi marui-iron-pole marui-jisa-jigoku moju-no-aura tachibana-abare-jishi
chitose-kamikakushi tachibana-super-rising shiraishi-perfect-tennis kamio-rhythm ibu-kick-serve
akazawa-blur-ball jiro-magic-volley kabaji-copies-hyakuren ootori-neo-scud nanjiro-closed-eyes
kite-shukuchiho-all shukuchiho-counter yuta-rising itsuki-sinker fuji-cord-ball-fix atobe-returns-ka
kirihara-ka-weakness fuji-upper-body-split ryoma-first-opponent tezuka-enters-ryoma
ryoma-momo-off-hand ryoma-kaido-ranking-plan nanjiro-coach inui-loses-regular horio-impersonates
kaido-impersonates tezuka-why-challenge tezuka-ryoma-spectator tezuka-doctor-warning tezuka-pillar
street-doubles-partner fudomine-unknown-why fudomine-car-accident dan-admires-akutsu
ryoma-sub-reason inui-kaido-deal oishi-tezuka-promise tezuka-elbow-origin yamato-former-captain
kanto-final-missing inui-forget-data fuji-plays-blind fuji-hatred-quote fuji-serious-trigger
tezuka-beat-sanada-past ryoma-amnesia-place ending-new-captain ending-tezuka-germany
ending-ryoma-america kawamura-dream inui-stops-kaido kaido-solo-doubles yagyu-asks-kaido
chitose-eye-injury niou-yagyu-swap kirihara-ryoma-red-eyes ryoma-after-kirihara
rokkaku-nationals-r1-loss aoi-nationals-opponent hyotei-nationals-r1 rikkai-nationals-qf
kamio-beats-sengoku atobe-beats-mizuki kenya-gin-pair inui-kaido-nationals-r1 seigaku-kanto-r2
golden-pair-district-final golden-pair-vs-jimmies kawamura-momo-kanto-semis-result
eiji-first-singles-result district-semi-opponent tokyo-semi-opponent fuji-opens-kanto-final
ryoma-atobe-collapse niou-illusion-cost oshitari-f-and-d ryoma-drive-d tanishi-carioca
ryoma-challenges-sanada fuji-mizuki-motive ryoma-closed-eyes-why momo-loses-regular
kirihara-wrong-bus ryoma-us-open-invite fuji-reveals-second-counter akutsu-throws-rocks
training-camp-bear kabaji-copies-eiji kaido-knocks-out-jiro
```

## Existing glossary

A snapshot of `src/games/prince-of-tennis/glossary.json` on 2026-11-26 (52 entries), in the output shape. Reuse these labels as written, and do not send them again. Use them as the model for new entries.

```json
{
  "สภาวะไร้ตัวตน": {"romaji": "Muga no Kyōchi", "kanji": "無我の境地", "english": "State of Selflessness"},
  "ฮยาคุเร็น จิโทคุ โนะ คิวามิ": {"romaji": "Hyakuren Jitoku no Kiwami", "kanji": "百錬自得の極み", "english": "Pinnacle of Hard Work"},
  "ไซกิ คัมปัตสึ โนะ คิวามิ": {"romaji": "Saiki Kanpatsu no Kiwami", "kanji": "才気煥発の極み", "english": "Pinnacle of Great Wisdom"},
  "เท็นอิ มุโฮ โนะ คิวามิ": {"romaji": "Ten'i Muhō no Kiwami", "kanji": "天衣無縫の極み", "english": "Pinnacle of Perfection"},
  "ฟู ริน คา ซัน": {"romaji": "Fūrinkazan", "kanji": "風林火山", "english": "Wind, Forest, Fire, Mountain"},
  "นางแอ่นหวนกลับ": {"romaji": "Tsubame Gaeshi", "kanji": "燕返し", "english": "Swallow Return"},
  "พิฆาตหมีสีน้ำตาล": {"romaji": "Higuma Otoshi", "kanji": "羆落とし", "english": "Brown Bear Drop"},
  "ปลาวาฬเผือก": {"romaji": "Hakugei", "kanji": "白鯨", "english": "White Whale"},
  "ตบแมลงเม่า": {"romaji": "Kagerō Tsutsumi", "kanji": "蜉蝣包み", "english": "Mayfly Envelopment"},
  "บทเพลงแห่งหายนะ": {"romaji": "Hametsu e no Rondo", "kanji": "破滅への輪舞曲", "english": "Rondo Towards Destruction"},
  "อาณาจักรน้ำแข็ง": {"romaji": "Kōri no Sekai", "kanji": "氷の世界", "english": "Ice World"},
  "อาณาเขตของโออิชิ": {"romaji": "Ōishi no Ryōiki", "kanji": "大石の領域", "english": "Ōishi's Territory"},
  "ลูกถล่มปฐพี": {"romaji": "Hadōkyū", "kanji": "波動球", "english": "Wave-Motion Ball"},
  "ลูกคลุ้มคลั่ง": {"romaji": "Abare Dama", "kanji": "暴れ球", "english": "Wild Ball"},
  "ไต่เชือก": {"romaji": "Tsunawatari", "kanji": "綱渡り", "english": "Tightrope Walking"},
  "ดรอปศูนย์สัมบูรณ์": {"romaji": "Zero-Shiki Drop Shot", "kanji": "零式ドロップショット", "english": "Zero-Style Drop Shot"},
  "ซูเปอร์อุลตร้าเกรทดีลิเชียส ไดชาริน ยามะอาราชิ": {"romaji": "Chō Urutora Gurēto Derishasu Daisharin Yama Arashi", "kanji": "超ウルトラグレートデリシャス大車輪山嵐", "english": "Super Ultra Great Delicious Mountain Storm"},
  "เอ็นบุเทนนิส": {"romaji": "Enbu Tenisu", "kanji": "演武テニス", "english": "Enbu (Martial Demonstration) Tennis"},
  "ท่าย่นระยะทาง": {"romaji": "Shukuchihō", "kanji": "縮地法", "english": "Ground-Shrinking Method"},
  "ทวารบาลเฮคาตอนไคร์": {"romaji": "Hekatonkeiru no Monban", "kanji": "百腕巨人の門番", "english": "Gatekeeper of Hecatoncheires"},
  "เงา (อิน) กับ สายฟ้า (ไร)": {"romaji": "In, Rai", "kanji": "陰・雷", "english": "Shadow, Lightning"},
  "คามาอิทาจิ": {"romaji": "Kamaitachi", "kanji": "かまいたち", "english": "Wind Blade"},
  "ฮาบุ": {"romaji": "Habu", "kanji": "飯匙倩", "english": "Habu (Pit Viper)"},
  "เอ็นทาคุช็อต": {"romaji": "Entaku Shotto", "kanji": "円卓ショット", "english": "Round Table Shot"},
  "เสิร์ฟหายตัว": {"romaji": "Kieru Sābu", "kanji": "消えるサーブ", "english": "Disappearing Serve"},
  "นกฟีนิกซ์หวนกลับ": {"romaji": "Hōō Gaeshi", "kanji": "鳳凰返し", "english": "Phoenix Return"},
  "พิฆาตกิเลน": {"romaji": "Kirin Otoshi", "kanji": "麒麟落とし", "english": "Qilin Drop"},
  "มังกรขาว": {"romaji": "Hakuryū", "kanji": "白龍", "english": "White Dragon"},
  "พลุดวงดาว": {"romaji": "Hoshi Hanabi", "kanji": "星花火", "english": "Star Fireworks"},
  "แดชถล่มปฐพี": {"romaji": "Dasshu Hadōkyū", "kanji": "ダッシュ波動球", "english": "Dash Hadōkyū"},
  "ลูกถล่มปฐพีสองมือ": {"romaji": "Ryōte Hadōkyū", "kanji": "両手波動球", "english": "Two-Handed Hadōkyū"},
  "ลูกถล่มปฐพีแบบกระโดด": {"romaji": "Janpu Hadōkyū", "kanji": "ジャンプ波動球", "english": "Jump Hadōkyū"},
  "ไฟ (คา)": {"romaji": "Ka", "kanji": "火", "english": "Fire"},
  "ลม (ฟู)": {"romaji": "Fū", "kanji": "風", "english": "Wind"},
  "ป่า (ริน)": {"romaji": "Rin", "kanji": "林", "english": "Forest"},
  "ภูเขา (ซัน)": {"romaji": "Zan", "kanji": "山", "english": "Mountain"},
  "สายฟ้า (ไร)": {"romaji": "Rai", "kanji": "雷", "english": "Lightning"},
  "เงา (อิน)": {"romaji": "In", "kanji": "陰", "english": "Shadow"},
  "เสิร์ฟล่องหน": {"romaji": "Mienai Sābu", "kanji": "見えないサーブ", "english": "Invisible Serve"},
  "อินไซต์": {"romaji": "Insaito", "kanji": "眼力", "english": "Insight"},
  "ปืนใหญ่พยัคฆ์ (โคโฮ)": {"romaji": "Kohō", "kanji": "虎砲", "english": "Tiger Cannon"},
  "สเต็ปตราคิคุมารุ": {"romaji": "Kikumaru-jirushi no Suteppu", "kanji": "菊丸印のステップ", "english": "Seal Step"},
  "จั๊กจั่นลอกคราบ": {"romaji": "Utsusemi", "kanji": "空蝉", "english": "Cicada"},
  "ลูกอัดเสาเหล็ก": {"romaji": "Tetchū Ate", "kanji": "鉄柱当て", "english": "Iron Pole Strike"},
  "นรกเหลื่อมเวลา (จิซะจิโงคุ)": {"romaji": "Jisa Jigoku", "kanji": "時間差地獄", "english": "Temporal Difference Hell"},
  "ออร่าสัตว์ป่า": {"romaji": "Mōjū no Ōra", "kanji": "猛獣のオーラ", "english": "Mōjū no Aura"},
  "ราชสีห์คลั่ง": {"romaji": "Abare Jishi", "kanji": "あばれ獅子", "english": "Abare Jishi"},
  "เทพบังตา": {"romaji": "Kamikakushi", "kanji": "神隠し", "english": "Kamikakushi"},
  "ซูเปอร์ไรซิ่ง": {"romaji": "Chō Raijingu", "kanji": "超ライジング", "english": "Super Rising"},
  "ลูกสั่น (บุเรดามะ)": {"romaji": "Bure Dama", "kanji": "ブレ球", "english": "Blur Ball"},
  "นิโทริว": {"romaji": "Nitōryū", "kanji": "二刀流", "english": "Nitōryū"},
  "โหมดปีศาจ": {"romaji": "Akuma-ka", "kanji": "悪魔化", "english": "Devil Mode"}
}
```

## Before you hand it over

1. Check that the file is valid JSON.
2. Check that every `id` is new and appears once.
3. Check that every question has 3 decoys and 4 distinct options.
4. Open each `source` and confirm that `evidence` is on the page.
5. Check that every Japanese technique label has a glossary entry, and that every glossary key is an option in a question.
6. Check that every glossary entry has all three fields: `romaji`, `kanji`, `english`.
7. Read every prompt and note again, and remove any name that answers another question.

## Importing (for the maintainer)

1. Append each question, `evidence` included, to the array in `questions.json`.
2. Add each glossary entry to the object in `glossary.json`.
3. Bring names and move labels to the spellings in [Thai spelling](#thai-spelling).
4. Check rules 5 and 6 against the whole bank, not only the new file: a new prompt or note can answer an old question, and the other way round.
5. Run `bun test src/games/prince-of-tennis`. It fails on a wrong shape, a repeated id, a gloss no option uses, or a tier under 15.
6. Update the tier counts, the id snapshot and the glossary snapshot in this document.
