# Spec: Rename to byou, add Vercel Analytics

Status: ready-for-agent

## Problem Statement

The site is to be called byou, and the owner wants page views counted on the Vercel deployment.

## Solution

Every name a player or developer sees reads byou. Vercel Analytics records page views on every page.

## User Stories

1. As a player, I want the wordmark and the tab titles to say byou, so that I know which site I am on.
2. As a returning player, I want my saved play, theme and sound choice to survive the rename, so that nothing resets.
3. As the owner, I want page views in the Vercel dashboard, so that I can see which quizzes people play.

## Implementation Decisions

- **The name.** `byou`, lowercase as the owner wrote it: the wordmark on the home page and the top strip, the root `<title>`, each page's `… · byou` title, the package name, the README, `GLOSSARY.md` and the docs.
- **Analytics.** `@vercel/analytics`, its `<Analytics />` from `@vercel/analytics/next` once in the root layout. It sends page views only when deployed on Vercel.

## Assumptions

Taken without a grilling round; veto here.

- **Storage keys stay `knowyou:*`.** Renaming them would drop every saved play, the reveal switch, the theme and the sound choice. Players never see them.
- **Closed specs keep KnowYou.** They record past work. The repo folder name is unchanged.
- **No consent banner.** Vercel Analytics sets no cookies.

## Testing Decisions

`bun test`, `bun run typecheck`, `bun run build`; in the browser, the wordmark and tab title read byou, a saved play from before the rename still restores, and the page loads the analytics script without console errors (it reports only on a Vercel deployment).

## Out of Scope

Custom events, Speed Insights, a domain change.
