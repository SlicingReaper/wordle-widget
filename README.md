# W WORDLE// — the daily word game

![macOS](https://img.shields.io/badge/macOS-Übersicht-3ef0ff?style=flat-square&logo=apple&logoColor=white&labelColor=040914) ![Vibecoded](https://img.shields.io/badge/vibecoded-with%20Claude-ff5ad9?style=flat-square&labelColor=040914)

Guess the five-letter word in six tries, right on your desktop. One word per day, plus a new random word whenever you want. No backend: the game, both word lists and your stats live in one widget file.

| File | What |
|:--|:--|
| `wordle-langs.json` | French, Spanish and German lists: 1,300 common answers + ~5,000 allowed guesses each (98 KB) |
| `wordle.jsx` | The whole game, including the original Wordle word lists (2 315 answers + 10 657 extra allowed guesses, from the MIT-licensed npm package `wordle-words`). |

## Play

**Click the board**, type a word, press **⏎**. Backspace deletes. The mini keyboard under the board is clickable too and shows what you've learned about each letter.

| Tile | Means |
|:--|:--|
| accent colour | right letter, right spot |
| amber | in the word, wrong spot |
| dark | not in the word |

Double letters are scored like the original. Words that aren't in the list shake and don't cost a try.

- **Four languages:** the amber **EN** button cycles **EN → FR → ES → DE**. Each language has its own daily word, stats and keyboard: French on AZERTY with accents ignored (*été* = *ETE*), Spanish with **Ñ**, German on QWERTZ with **Ä Ö Ü**. Physical keys work too, and accented letters typed in French are folded automatically.
- **One word per day**, new at local midnight. Win or lose, a card shows the word and your 1–6 guess distribution (click it to see the board again).
- **NEW ▸** any time (or ⏎ when a game is over): a random word, as many as you like. Random words don't touch the daily stats; **◂ DAILY** goes back.
- **Stats:** TODAY · LAST (yesterday's result) · STREAK · MAX streak · WIN %, saved in `~/Library/Application Support/STUDYTERM/wordle.json`.

## 📚 Word lists

- **English:** the original Wordle lists.
- **French, Spanish, German:** built for this widget. Answers are the 1,300 most frequent five-letter words in subtitle frequency lists ([FrequencyWords](https://github.com/hermitdave/FrequencyWords), OpenSubtitles 2018) that are also real entries in the Hunspell dictionaries ([dictionary-fr / -es / -de](https://github.com/wooorm/dictionaries)). Names were filtered out, mostly. Allowed guesses add every other five-letter word from both sources. Spellings follow common local Wordle conventions: French drops accents, Spanish keeps Ñ, German keeps Ä Ö Ü and leaves out words with ß.

## 🚀 Install

1. Download this repo (green **Code** button → *Download ZIP*) and double-click **`install.command`**. The first time, macOS may block it: right-click → *Open*.
   It installs [Übersicht](https://tracesof.net/uebersicht/) if you don't have it and copies `wordle.jsx` into its widgets folder.
2. Click the board to play. If clicks fall through to the desktop: Übersicht menu-bar icon → this widget → turn on interaction.

- **Needs:** macOS 13+ · nothing else, the game is a single file
- **By hand:** copy `wordle.jsx` into Übersicht's widgets folder (menu-bar icon → *Open Widgets Folder*).
- **Remove:** delete `wordle.jsx` from the widgets folder.

## 🎨 Look and position

Out of the box it sits in its default spot in the cyan terminal theme. Install [**WIDGET//CTL**](https://github.com/SlicingReaper/widgetctl) to drag it anywhere on a grid and pick from 16 colour schemes × 8 styles, and to get `⌃⌥⌘W`, which hides all widgets at once.

*Wordle is a trademark of The New York Times. This is an unofficial fan-made widget.*

## 🧩 Part of a collection

This widget is one of fifteen that share the same retro-terminal look, the same theming and the same show/hide hotkey. Each works on its own; together they make a desktop dashboard.

| | Widget | What |
|:-:|:--|:--|
| 💰 | [**WALLET//Ð**](https://github.com/SlicingReaper/points-wallet-widget) | Points wallet: earn for habits, spend on rewards, lock savings, keep a streak |
| 🔥 | [**75//HARD**](https://github.com/SlicingReaper/75-hard-widget) | 75 Hard challenge tracker: 7 daily tasks, day counter, auto-fail on a missed day |
| ⏱️ | [**STUDY//TERM**](https://github.com/SlicingReaper/study-timer-widget) | Study stopwatch that logs what you did, with a stats page and points |
| ✎ | [**NOTE//PAD**](https://github.com/SlicingReaper/notepad-widget) | Checklist notes with deadline countdowns, auto-expiry and a bin |
| “ | [**QUOTE//DAY**](https://github.com/SlicingReaper/quote-of-the-day-widget) | A new quote every midnight from a pool of 300, with likes and your own quotes |
| ▦ | [**TETRIS//GRID**](https://github.com/SlicingReaper/tetris-widget) | Tetris on the desktop: hold, ghost piece, levels, best score |
| ◉ | [**PONG//SOLO**](https://github.com/SlicingReaper/pong-widget) | Single-player Pong: keep the ball up, it speeds up every hit |
| ◎ | [**PONG//DUO**](https://github.com/SlicingReaper/pong-duo-widget) | Two-player Pong, 3 widgets wide: W/S vs ↑/↓, first to 7 |
| ⊞ | [**2048//TILE**](https://github.com/SlicingReaper/2048-widget) | 2048 with undo, keyboard or drag, saved between sessions |
| ⌂ | [**OUTPOST//**](https://github.com/SlicingReaper/outpost-colony-widget) | Colony-trading game: claim land, outfit robots, trade against 3 AI rivals |
| ☠ | [**DOOM//TERM**](https://github.com/SlicingReaper/doom-widget) | DOOM shareware Episode 1 in a 2-column widget: WebAssembly engine, savegames kept |
| ◍ | [**GLOBE//GUESS**](https://github.com/SlicingReaper/globe-widget) | Daily mystery country on a spinning globe: every guess glows hotter the closer it is |
| ◍ | [**ATLAS//QUIZ**](https://github.com/SlicingReaper/atlas-quiz-widget) | Sporcle-style map quiz: type a name, the country lights up green. World, continents, US states |
| W | [**WORDLE//**](https://github.com/SlicingReaper/wordle-widget) ← you are here | Wordle in EN · FR · ES · DE: daily word, a new word any time, streaks, guess distribution |
| 🎛️ | [**WIDGET//CTL**](https://github.com/SlicingReaper/widgetctl) | Menu-bar app that arranges and themes all the widgets, plus a ⌃⌥⌘W show/hide hotkey |

**Install all of them at once:** [`vibecoded` → install-all.command](https://github.com/SlicingReaper/vibecoded) · 🤖 Vibecoded with [Claude](https://claude.ai): I designed, directed and tested it, the AI wrote most of the code.
