# 🧬 Sarcomere Stop-Motion Challenge

A peer-assessment game on **muscle contraction and sarcomere structure** (MSK).
It's plain HTML, CSS and JavaScript, with no installs, accounts, server or build step.

| Round | What the player does |
|---|---|
| **1 · Sequence Sort** | Drag 12 shuffled cards into order, from the action potential at the axon terminal to relaxation. Correct cards snap and glow, wrong ones shake. Hints cost points. |
| **2 · Build the Sarcomere** | Drag Z discs, thick and thin filaments and the M line into place to build a **relaxed** sarcomere, avoiding decoy pieces. Then label the A band, I band, H zone and M line. |
| **3 · What's Missing?** | Tap-only. 8 scenarios, each removing one ingredient of contraction (e.g. no ATP, no Ca²⁺ from the SR, no acetylcholinesterase). For each, tap (a) which step of the Round 1 sequence fails and (b) what the muscle does (can't contract / can't relax / stays contracted / contracts weakly). Wrong answers get a nudge without giving the answer away. A paid hint unlocks after 2 wrong tries, and after 3 the answer is explained (no points for that scenario). The failing step lights up on the Round 1 sequence list. ↺ Restart is available. |
| **Quick-fire** | Multiple-choice questions with an explanation after each answer (optional timer). |
| **Results** | Score breakdown, rating (e.g. *Sarcomere Master*) and a local leaderboard. |

Extras: **👥 Partner Mode** (an examiner checklist for explaining out loud, worth +25 per point), **🔑 Examiner view** (full answer key, printable), streaks, and a progress bar.

---

## ▶ Run it locally

**Option A: just open it.** Double-click `index.html`. It works straight from the folder in Chrome, Edge, Safari and Firefox, and works offline.

**Option B: local server** (only needed if your browser is strict about local files):
```bash
cd sarcomere-challenge
python3 -m http.server 8000
```
Then visit http://localhost:8000.

Works with a mouse, touchscreen or pen. On tablets you can also **tap a card, then tap a slot** instead of dragging.

---

## 🌍 Put it online for free (GitHub Pages)

1. Create a free account at github.com, then click **New repository** (e.g. `sarcomere-challenge`) and make it **Public**.
2. Upload the files: **Add file → Upload files**, drag in *everything inside* this folder (`index.html`, `css/`, `js/`, `README.md`), then **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment* choose **Source: Deploy from a branch**, **Branch: `main`**, folder **`/ (root)`**, then **Save**.
4. After about a minute your game is live at `https://<your-username>.github.io/sarcomere-challenge/`.

Each time you update a file on GitHub, the site updates within a minute or two.

---

## ✏️ Edit the questions and cards

All content is in **`js/content.js`**. Open it in any text editor (VS Code, Notepad, TextEdit in plain-text mode).

- `sequence`: the 12 Round 1 cards, **in the correct order** (the game shuffles them).
- `questions`: the quick-fire bank. `answer` is the index of the correct option (0 = first). Options are shuffled in the game.
- `partnerPrompts`: the examiner checklists for each round.
- `dimensions`: filament and sarcomere lengths in µm. Rounds 2, 3 and the examiner view all redraw from these.
- `decoys`: the trick pieces in Round 2 and their feedback text.
- `ratings`: the rating titles and the % thresholds for each.
- `whatsMissing`: Round 3 scenarios. For each one: the "missing" text, the step that fails (`answer`, as a Round 1 step number) and the other step options, a nudge for each wrong option, hints, explanations, and the muscle response. Also the 4 response options and how many wrong tries unlock the hint and the reveal.
- `settings`: number of quick-fire questions and timer seconds.

Keep the quotes and commas. If the page goes blank after an edit, a comma or quote is probably missing. Press F12 and look at the Console for the line number.

> Why `content.js` and not `content.json`? Browsers block pages opened from a folder (`file://`) from loading JSON files, so the content is stored as a JavaScript object to keep "double-click to open" working.

---

## 💾 Scores
Scores are kept in the browser's **localStorage** on that device only. Nothing is sent anywhere. Clear them from **Examiner view → Clear station leaderboard**. In a private/incognito window the game still works, but scores aren't kept.

## 📁 Files
```
index.html          screens & layout
css/styles.css      visual style
js/content.js       ← all editable content
js/state.js         score, streaks, leaderboard
js/drag.js          mouse/touch drag-and-drop
js/sarc-svg.js      sarcomere drawings
js/round1.js · round2.js · round3.js · quickfire.js · teacher.js · app.js
```
