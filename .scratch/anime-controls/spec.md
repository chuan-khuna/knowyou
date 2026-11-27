# Anime controls

Status: ready-for-agent

## Problem Statement

The theme switch and the mock ads now speak the drawn, anime look: an ink line, flat tones, a hard offset shadow, and a reaction when used. The controls a player touches most do not. The card-stock buttons, the settings row with its switch, the number fields and the province or university select still have thin rules and a 2px drop edge. Next to the theme switch they look like a different site.

## Solution

Every card-stock control across the site takes the anime look: a 2px ink line, a flat hard shadow offset down and right, and a press that sinks the control into its shadow with a small squash and springs back. The settings switch becomes a drawn switch like the theme switch. Its knob dashes across, slams into the end and shows a tick when on, with a mint track. Picking a preset throws a few ticks.

## User Stories

1. As a player, I want the buttons, options, fields and switches to look like the theme switch and the ads, so that the site reads as one drawn world.
2. As a player, I want a pressed button to sink into its shadow and spring back, so that a press feels physical.
3. As a player, I want the answer options to keep their right and wrong colours in the reveal, so that the reveal still reads at a glance.
4. As a player, I want the picked preset (20 ข้อ, 30 ข้อ, ขั้นสูง) to stay obviously picked, so that I know my setting.
5. As a player, I want picking a preset to throw a few ticks, so that the pick feels answered.
6. As a player, I want the เฉลยทุกข้อ switch to dash and slam like the theme switch, with a tick on its knob when it is on, so that its state is obvious and turning it on feels like a hit.
7. As a keyboard player, I want Space on the switch and Enter on a button to show the same reactions as a tap.
8. As a screen-reader player, I want every control to keep its role, name and state.
9. As a player in dark mode, I want the lines and shadows drawn from the dark theme's tokens.
10. As a player who asked for reduced motion, I want no dash, squash or drawn effect, with every state change still at once.

## Implementation Decisions

- **Scope** (decided in chat: the whole site). The rules change at the shared classes: `.stock` and its variants (`--primary`, `.option` with its locked, right, wrong and faded states, `.num` presets, `.game-card`), `.select`, `.toggle-row`, `.switch` and `.stepper`. Chips, badges, the seed chip and the icon buttons keep their look.
- **One line token.** `--color-line` in `tokens.css` is `--color-ink` 80% into `--color-paper`, the mock ads' edge and the effects' line. The ads, the theme switch and the controls use it.
- **The look.** A 2px `--color-line` border and a hard shadow at 3px 4px with no blur, in a shadow tone mixed from ink and rule. The primary button's shadow is mixed from `--color-accent-deep`. Hover lifts the control 1px against a 4px 5px shadow. A press moves the control down into its shadow, so the shadow goes to zero, and squashes it to 101.5% wide by 97% tall. Release springs back on `--ease-spring`. Right and wrong options colour their border instead of an inset ring.
- **The switch.** `.switch` moves from a styled checkbox to an `AnimeSwitch` component. It keeps a real `<input type="checkbox" role="switch">` over a drawn track and knob, so the form, the label and the keys work as before. A flip runs the theme switch's dash, slam and settle on the knob. Turning on shows a tick on the knob and floods the track mint, with a small impact and ติ๊ง!. Turning off throws one small puff.
- **The preset pick.** A press on a preset throws three ticks off its top-right corner (`pickEffect`).

## Assumptions

- The shadow is 3px 4px, smaller than the ads' 4px 5px, because controls sit closer together than ads.
- ติ๊ง! plays when the switch turns on, and no word plays when it turns off.
- The stepper and the select get the line and shadow, but no press, because they are fields.

## Testing Decisions

- No unit test: this is styling and canvas drawing. Check in the browser, by frames:
  - The quiz intro, a question, a reveal, and a result.
  - A game intro and result.
  - The home page cards.
  - Light and dark, at 390px and desktop widths.
  - The switch by tap and by Space.
- `bun run typecheck`, `bun test` and `bun run build` pass.

## Out of Scope

- Painted art, new sound words, and sound changes.

## Comments

- **The fields react too** (asked in chat during the build). − and + squash, throw wedges and pop the number. The dice tumbles, and the new code pops with a glint (`stepEffect`, `rollEffect`). The stepper buttons squash on press.
- **Dark contrast** (asked in chat). The first drop was mixed from ink and rule, and in dark mode that made a light grey-pink slab. The drop is now its own token, `--color-drop`: a grey-blue by day and a night blue by night. The dark card is lifted from 23% to 25.5% lightness, and `--color-knob` lifts the switch's knob off its dark track.
- `--color-edge` is gone: nothing used it after the restyle.

