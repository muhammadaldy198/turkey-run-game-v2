# turkey-run-game-v2

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![make.fun · rank](https://make.fun/badge/turkey-run-game-01/muhammadaldy198/turkey-run-game-v2/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![make.fun · reward](https://make.fun/badge/turkey-run-game-01/muhammadaldy198/turkey-run-game-v2/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

## GOBBLE OR GONE: Dawn Dash

A turkey escape game — a side-view runner. You are the turkey. Thanksgiving is coming, the farmer is right behind you, the oven is lit, and the carving knife falls from the sky. Run 7,200 px through the yard, the barn and the kitchen, take the high road or the low road at three gates, and dive out the dawn window before the dinner bell rings.

**3 gates · 3 feathers · 120 seconds · 1 dinner bell.**

## How to play

- The turkey runs itself to the right. You steer the vertical:
- **SPACE / UP / click** — jump (hay, fences, crates, oven flames, stuck knives).
- **DOWN / S** — slide (low beams, the lower road at a gate).
- **G** — gobble: scares the farmer off for 2 seconds (8 s cooldown).
- **1 / 2** — at a gate, pick the upper road (jump the beam) or the lower road (slide under).
- **P** — pause. **R** — run again after the end screen.

## The systems (all visible in the screenshots)

- **The farmer is a gap, not a guard** — he chases from behind, measured in metres on the HUD. Clean running opens the gap; every trip slams it shut; two quick trips and he grabs you. A feather buys your freedom; lose all three and you are dinner. Under 20 seconds on the bell he closes twice as fast.
- **3 gate forks** — each gate is a real fork in the track: JUMP THE BEAM (high road, golden feather, +25) or SLIDE UNDER (low road, corn line, +10). The choice is the move — there is no menu, no pause, no countdown.
- **3 feathers = lives** — a catch costs one; the turkey breaks free and the farmer falls back.
- **Dinner bell, 120 seconds** — when it rings, the run is over.
- **Corn = score, golden feather per gate** — and the clock pays: every second left at the escape is worth 5 points of time bonus, shown on the end screen.
- **Kitchen hazards** — the oven breathes fire across the track on a 1.6 s cycle (jump the flame while it burns), and carving knives fall on marked spots with a 0.7 s warning, then stick in the ground as one more thing to jump.

## Run it

```sh
node serve.ts   # http://localhost:8080
```

Screenshots are real renders of the game in a browser (`?shot=chase|title|gate|escaped&seed=1`). `main.ts` hands the game in: it copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json`.

Entry for the [turkey-run-game-01](https://make.fun/bounty/turkey-run-game-01) bounty on make.fun. v2 is a total rebuild of the v1 entry (new repository, new concept): v1 was a top-down stealth game — v2 is a side-view runner. Same turkey, same farmer, same oven, same knife, same dawn — a different game.
