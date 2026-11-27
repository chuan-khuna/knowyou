# byou

A family of guessing games for Thai players. Each game asks questions until it is confident, then guesses one hidden fact about you, just once.

| Game | Guesses | Status |
|---|---|---|
| ทายอายุจากการ์ตูน (Anime Age) | your age, from the anime you watched growing up | playable |
| ทายจังหวัด (Province) | the Thai province you live in | planned |
| ทายมหาวิทยาลัย (University) | your university, from campus life | playable |

## How it works

Every question records P(answer | hidden value). Each answer updates a probability distribution over the possible values: Bayesian narrowing. The game picks the question that narrows the belief most, and stops when one value is likely enough. After the guess, it shows your **memory strata**: how much you knew from each era, in Common Era years.

See [`GLOSSARY.md`](GLOSSARY.md) for the terms and [`docs/documents/INDEX.md`](docs/documents/INDEX.md) for the design documents.

## Develop

The tool versions are pinned in `mise.toml` (bun, node).

```sh
bun install
bun run dev        # start the dev server
bun run typecheck  # check types
bun run build      # export a static site to out/
```

Tune the Anime Age question bank:

```sh
bun run curve <question-id>   # print one question's P(answer | age)
bun run sim [playsPerAge]     # simulate players and report hit rate by age
```

## Analytics

The root layout renders `<Analytics />` from `@vercel/analytics`, which counts page views on the Vercel deployment and does nothing elsewhere. It sets no cookies. The spec is `.scratch/byou-and-analytics/spec.md`.

## Credits

Inspired by [あなたの年齢を当てます (nenrei)](https://kepigame.com/games/nenrei.html) by kepigame, which guesses your age from the fads you remember. byou is an independent project with its own questions and code. It is not affiliated with kepigame.
