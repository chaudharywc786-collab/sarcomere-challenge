/* Game state: score, streaks, hints, progress, localStorage.
   Exposes window.Game. */
(function () {
  "use strict";
  const C = window.SARC_CONTENT;
  const STORE_KEY = "sarcomere-challenge-v1";

  // Points table (kept here so the examiner view can display it)
  const POINTS = {
    r1Correct: 100, r1Wrong: -25, r1Hint: -50, r1Perfect: 300,
    r2Piece: 60, r2PieceWrong: -40, r2Label: 50, r2LabelWrong: -20, r2Perfect: 200,
    r3First: 50, r3Later: 25, r3Hint: -15, r3Finish: 150,
    partnerTick: 25,
    qfCorrect: 60, qfSpeedMax: 20, qfStreakMax: 20,
    streakStep: 10, streakCap: 50
  };

  const ROUNDS = ["r1", "r2", "r3", "qf"];
  const ROUND_NAMES = { r1: "Round 1 · Sequence Sort", r2: "Round 2 · Build the Sarcomere", r3: "Round 3 · What's Missing?", qf: "Quick-fire", partner: "Partner explanations" };

  function maxPoints() {
    const n = C.sequence.length;
    const qn = Math.min(C.settings.quickfireCount, C.questions.length);
    let streakBonusR1 = 0; // streak bonus for a perfect Round 1
    for (let s = 1; s <= n; s++) if (s >= 3) streakBonusR1 += Math.min(POINTS.streakCap, (s - 2) * POINTS.streakStep);
    // Round 3: two questions per scenario, all right first time
    const r3Answers = C.whatsMissing.scenarios.length * 2;
    let streakBonusR3 = 0;
    for (let s = 1; s <= r3Answers; s++) if (s >= 3) streakBonusR3 += Math.min(POINTS.streakCap, (s - 2) * POINTS.streakStep);
    return {
      r1: n * POINTS.r1Correct + POINTS.r1Perfect + streakBonusR1,
      r2: 6 * POINTS.r2Piece + 4 * POINTS.r2Label + POINTS.r2Perfect,
      r3: r3Answers * POINTS.r3First + streakBonusR3 + POINTS.r3Finish,
      qf: qn * (POINTS.qfCorrect + POINTS.qfSpeedMax + POINTS.qfStreakMax)
    };
  }

  function fresh(name) {
    return {
      player: name || "Player",
      scores: { r1: 0, r2: 0, r3: 0, qf: 0, partner: 0 },
      streak: 0, bestStreak: 0,
      hints: 0, mistakes: 0, correct: 0,
      round: null, roundProgress: 0,
      partnerTicks: {},           // key -> true
      qfTimed: false
    };
  }

  /* ---------- storage (fails gracefully in private mode) ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function save(data) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
  }

  const listeners = [];

  const Game = {
    POINTS, ROUNDS, ROUND_NAMES,
    s: fresh(),
    onChange(fn) { listeners.push(fn); },
    emit() { listeners.forEach(fn => fn(Game.s)); },

    start(name, timed) {
      Game.s = fresh(name);
      Game.s.qfTimed = !!timed;
      Game.emit();
    },
    total() { const sc = Game.s.scores; return Math.max(0, sc.r1 + sc.r2 + sc.r3 + sc.qf + sc.partner); },

    /* Award points. Returns the amount actually added. */
    add(round, pts, where, label) {
      Game.s.scores[round] += pts;
      if (where) Game.popup((pts > 0 ? "+" : "") + pts + (label ? " " + label : ""), where, pts >= 0 ? "good" : "bad");
      Game.emit();
      return pts;
    },
    /* A correct action: base points + streak bonus */
    correct(round, base, where) {
      Game.s.streak += 1;
      Game.s.correct += 1;
      Game.s.bestStreak = Math.max(Game.s.bestStreak, Game.s.streak);
      const bonus = Game.streakBonus();
      Game.add(round, base + bonus, where, bonus ? "🔥" : "");
      return base + bonus;
    },
    wrong(round, penalty, where) {
      Game.s.streak = 0;
      Game.s.mistakes += 1;
      if (penalty) Game.add(round, penalty, where); else Game.emit();
    },
    streakBonus() {
      const s = Game.s.streak;
      return s >= 3 ? Math.min(POINTS.streakCap, (s - 2) * POINTS.streakStep) : 0;
    },
    setRound(r, progress) { Game.s.round = r; Game.s.roundProgress = progress || 0; Game.emit(); },
    setProgress(p) { Game.s.roundProgress = Math.max(0, Math.min(1, p)); Game.emit(); },

    percent() {
      const m = maxPoints();
      const max = m.r1 + m.r2 + m.r3 + m.qf;
      return Math.max(0, Math.min(100, Math.round(100 * Game.total() / max)));
    },
    rating() {
      const pct = Game.percent();
      return C.ratings.slice().sort((a, b) => b.min - a.min).find(r => pct >= r.min) || C.ratings[C.ratings.length - 1];
    },
    maxPoints,

    /* ---------- leaderboard ---------- */
    leaderboard() { return (load().leaderboard || []); },
    saveResult() {
      const data = load();
      const lb = data.leaderboard || [];
      const entry = { name: Game.s.player, score: Game.total(), pct: Game.percent(), rating: Game.rating().title, date: new Date().toISOString().slice(0, 10) };
      lb.push(entry);
      lb.sort((a, b) => b.score - a.score);
      data.leaderboard = lb.slice(0, C.settings.leaderboardSize);
      save(data);
      return data.leaderboard.indexOf(entry);
    },
    clearLeaderboard() { const d = load(); d.leaderboard = []; save(d); },
    prefs() { return load().prefs || {}; },
    setPrefs(p) { const d = load(); d.prefs = Object.assign(d.prefs || {}, p); save(d); },

    /* ---------- floating "+100" popups ---------- */
    popup(text, where, kind) {
      let x, y;
      if (where && where.getBoundingClientRect) {
        const r = where.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2;
      } else if (where && "x" in where) { x = where.x; y = where.y; } else return;
      const el = document.createElement("div");
      el.className = "points-pop " + (kind || "good");
      el.textContent = text;
      el.style.left = x + "px"; el.style.top = y + "px";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    }
  };

  window.Game = Game;
})();
