/* QUICK-FIRE — multiple-choice questions with explanations */
(function () {
  "use strict";
  const C = window.SARC_CONTENT, G = window.Game, P = G.POINTS;
  const $ = (id) => document.getElementById(id);
  let deck, idx, answered, timer, tStart, qfStreak, right;

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function start() {
    G.setRound("qf", 0);
    const n = Math.min(C.settings.quickfireCount, C.questions.length);
    deck = shuffle(C.questions).slice(0, n);
    idx = 0; qfStreak = 0; right = 0;
    show();
  }

  function show() {
    const q = deck[idx];
    answered = false;
    $("qf-count").textContent = `Question ${idx + 1} / ${deck.length}`;
    $("qf-topic").textContent = q.topic;
    $("qf-question").textContent = q.q;
    $("qf-explain").hidden = true;
    $("qf-next").hidden = true;
    const opts = shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })));
    const box = $("qf-options");
    box.innerHTML = "";
    opts.forEach((o, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "qf-opt";
      b.dataset.correct = o.correct ? "1" : "0";
      b.innerHTML = `<span class="opt-key">${"ABCD"[i] || i + 1}</span><span>${o.text}</span>`;
      b.addEventListener("click", () => answer(b));
      box.appendChild(b);
    });
    G.setProgress(idx / deck.length);
    clearInterval(timer);
    const track = $("qf-timer-track");
    track.hidden = !G.s.qfTimed;
    if (G.s.qfTimed) {
      const secs = C.settings.quickfireSeconds;
      tStart = Date.now();
      $("qf-timer").style.width = "100%";
      timer = setInterval(() => {
        const left = 1 - (Date.now() - tStart) / (secs * 1000);
        $("qf-timer").style.width = Math.max(0, left * 100) + "%";
        $("qf-timer").classList.toggle("low", left < 0.3);
        if (left <= 0) { clearInterval(timer); answer(null); }
      }, 100);
    } else tStart = Date.now();
    const first = box.querySelector("button"); if (first) first.focus({ preventScroll: true });
  }

  function answer(btn) {
    if (answered) return;
    answered = true;
    clearInterval(timer);
    const q = deck[idx];
    const buttons = Array.from(document.querySelectorAll(".qf-opt"));
    buttons.forEach((b) => { b.disabled = true; if (b.dataset.correct === "1") b.classList.add("right"); });
    const ok = btn && btn.dataset.correct === "1";
    if (ok) {
      qfStreak++; right++;
      let pts = P.qfCorrect;
      if (G.s.qfTimed) {
        const frac = 1 - (Date.now() - tStart) / (C.settings.quickfireSeconds * 1000);
        pts += Math.round(P.qfSpeedMax * Math.max(0, frac));
      }
      pts += Math.min(P.qfStreakMax, Math.max(0, qfStreak - 1) * 5);
      G.s.streak++; G.s.correct++; G.s.bestStreak = Math.max(G.s.bestStreak, G.s.streak);
      G.add("qf", pts, btn);
    } else {
      qfStreak = 0;
      if (btn) { btn.classList.add("wrong", "shake"); }
      G.wrong("qf", 0, btn || $("qf-question"));
      if (!btn) App.toast("⏰ Time's up!", "bad");
    }
    const ex = $("qf-explain");
    ex.innerHTML = `<b>${ok ? "✔ Correct!" : "✘ Not quite."}</b> ${q.explain}`;
    ex.className = "qf-explain " + (ok ? "ok" : "no");
    ex.hidden = false;
    const nx = $("qf-next");
    nx.textContent = idx + 1 < deck.length ? "Next ▶" : "See results 🏁";
    nx.hidden = false;
    nx.focus({ preventScroll: true });
    G.setProgress((idx + 1) / deck.length);
  }

  function next() {
    idx++;
    if (idx < deck.length) show();
    else App.go("results");
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("qf-next").addEventListener("click", next);
    document.addEventListener("keydown", (e) => {
      if ($("screen-qf").hidden || answered) return;
      const k = e.key.toUpperCase();
      const i = "ABCD".indexOf(k);
      const b = document.querySelectorAll(".qf-opt")[i >= 0 ? i : +k - 1];
      if (b && (i >= 0 || /^[1-4]$/.test(k))) answer(b);
    });
  });

  window.Rounds = window.Rounds || {};
  window.Rounds.qf = { start, stop: () => clearInterval(timer), _stats: () => ({ right, total: deck ? deck.length : 0 }) };
})();
