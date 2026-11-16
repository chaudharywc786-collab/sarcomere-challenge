/* ROUND 3 — What's Missing?
   Tap-only. Each scenario removes one ingredient of muscle contraction.
   (a) Which step of the contraction sequence fails?  (b) What does the muscle do?
   Correct options are never highlighted before they're answered. All text lives in
   content.js -> whatsMissing. */
(function () {
  "use strict";
  const C = window.SARC_CONTENT, G = window.Game, P = G.POINTS, WM = C.whatsMissing;
  const $ = (id) => document.getElementById(id);
  const PARTS = ["step", "effect"];

  let st = null, run = 0, r3AtStart = 0;

  /* run-guarded timeout: callbacks from an abandoned run never touch a new one */
  function later(fn, ms) { const r = run; return setTimeout(() => { if (r === run) fn(); }, ms); }

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------------- lifecycle ---------------- */
  function start() {
    run++;
    G.setRound("r3", 0);
    r3AtStart = G.s.scores.r3;
    st = { idx: 0, part: 0, wrong: 0, hinted: false, earned: 0, done: false, totalWrong: 0, hints: 0, failed: 0, perfect: 0 };
    $("wm-done").hidden = true;
    $("wm-game").hidden = false;
    $("wm-restart").disabled = false;
    renderSequence();
    showScenario();
    // same as before: the examiner checklist opens by itself where it fits beside the game
    if (window.innerWidth >= 900) App.openPartner(true);
  }
  function stop() { run++; }

  /* ---------------- Round 1 sequence list (side panel) ---------------- */
  function renderSequence() {
    $("wm-seq").innerHTML = C.sequence.map((s, i) =>
      `<li data-step="${i + 1}"><span class="n">${i + 1}</span><span class="t">${esc(s.short)}</span><span class="wm-tag">✘ fails here</span></li>`).join("");
  }
  function highlightSteps(steps) {
    document.querySelectorAll("#wm-seq li").forEach((li) => li.classList.toggle("fails", steps.includes(+li.dataset.step)));
    // scroll only the side list (not the page) so the highlighted step is visible
    const first = document.querySelector("#wm-seq li.fails"), side = document.querySelector(".wm-side");
    if (first && side.scrollHeight > side.clientHeight) side.scrollTo({ top: first.offsetTop + $("wm-seq").offsetTop - side.clientHeight / 2, behavior: "smooth" });
  }

  /* ---------------- one scenario ---------------- */
  const sc = () => WM.scenarios[st.idx];
  const question = () => (st.part === 0 ? sc().stepQuestion : sc().effectQuestion);
  const stepLabel = (n) => `Step ${n}: ${C.sequence[n - 1].short}`;

  function showScenario() {
    const s = sc();
    st.part = 0; st.earned = 0;
    $("wm-count").textContent = `Scenario ${st.idx + 1} of ${WM.scenarios.length}`;
    $("wm-icon").textContent = s.icon || "🚫";
    $("wm-missing").textContent = s.missing;
    $("wm-dots").innerHTML = WM.scenarios.map((_, i) => `<li class="${i < st.idx ? "done" : i === st.idx ? "now" : ""}"></li>`).join("");
    $("wm-b").hidden = true;
    $("wm-next").hidden = true;
    $("wm-feedback-a").hidden = true; $("wm-feedback-b").hidden = true;
    highlightSteps([]);
    renderQuestion(0);
    progress();
    $("wm-card").classList.remove("pop"); void $("wm-card").offsetWidth; $("wm-card").classList.add("pop");
  }

  function renderQuestion(part) {
    st.part = part; st.wrong = 0; st.hinted = false;
    const s = sc();
    const box = $(part === 0 ? "wm-options-a" : "wm-options-b");
    let opts;
    if (part === 0) opts = shuffle(s.stepQuestion.options).map((n) => ({ value: String(n), label: stepLabel(n) }));
    else opts = shuffle(WM.effects).map((e) => ({ value: e, label: e }));
    box.innerHTML = "";
    box.classList.toggle("effects", part === 1);
    opts.forEach((o, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "wm-opt";
      b.dataset.value = o.value;
      b.innerHTML = `<span class="key">${"ABCD"[i] || i + 1}</span><span class="lbl">${esc(o.label)}</span>`;
      b.addEventListener("click", () => answer(b));
      box.appendChild(b);
    });
    if (part === 1) $("wm-b").hidden = false;
    updateHint();
  }

  function isCorrect(value) {
    const q = question();
    return st.part === 0 ? +value === q.answer : value === q.answer;
  }

  function feedbackEl() { return $(st.part === 0 ? "wm-feedback-a" : "wm-feedback-b"); }
  function feedback(kind, html) {
    const f = feedbackEl();
    f.className = "wm-feedback " + kind;
    f.innerHTML = html;
    f.hidden = false;
    f.classList.remove("flash"); void f.offsetWidth; f.classList.add("flash");
  }

  function answer(btn) {
    if (!st || st.done || btn.disabled) return;
    const q = question();
    if (isCorrect(btn.dataset.value)) {
      const pts = st.wrong === 0 ? P.r3First : P.r3Later;
      const got = G.correct("r3", pts, btn);
      st.earned += got;
      if (st.wrong === 0 && st.part === 1 && st.earnedFirstA) st.perfect++;
      if (st.part === 0) st.earnedFirstA = st.wrong === 0;
      lockOptions(btn.dataset.value, false);
      btn.classList.add("right");
      return resolvePart(true);
    }
    // wrong: nudge about the concept, never name the answer
    st.wrong++; st.totalWrong++;
    btn.classList.add("wrong", "shake"); btn.disabled = true;
    setTimeout(() => btn.classList.remove("shake"), 500);
    G.wrong("r3", 0, btn);
    const nudge = q.nudges[btn.dataset.value];
    if (st.wrong >= WM.revealAfter) return reveal();
    const left = WM.revealAfter - st.wrong;
    const hintNote = st.wrong >= WM.hintAfter ? " You can use 💡 Hint now." : "";
    feedback("no", `<b>✘ Not quite.</b> ${esc(nudge || "Think again about this step.")} <span class="muted">${left} ${left === 1 ? "try" : "tries"} left.${hintNote}</span>`);
    updateHint();
  }

  function lockOptions(correctValue, reveal) {
    const box = $(st.part === 0 ? "wm-options-a" : "wm-options-b");
    box.querySelectorAll(".wm-opt").forEach((b) => {
      b.disabled = true;
      if (reveal && b.dataset.value === correctValue) b.classList.add("revealed");
    });
  }

  /* part answered correctly */
  function resolvePart() {
    const q = question();
    feedback("ok", `<b>✔ Correct!</b> ${esc(q.explain)}`);
    if (st.part === 0) {
      highlightSteps(sc().highlight || [q.answer]);
      later(() => { renderQuestion(1); $("wm-b").scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 350);
      progress(0.5);
    } else {
      finishScenario();
    }
    updateHint();
  }

  /* 3 wrong tries: explain, show the answer(s), move on with no points for this scenario */
  function reveal() {
    const s = sc();
    st.failed++;
    if (st.earned) { G.s.scores.r3 -= st.earned; st.earned = 0; G.emit(); }
    const q = question();
    lockOptions(st.part === 0 ? String(q.answer) : q.answer, true);
    if (st.part === 0) {
      highlightSteps(s.highlight || [q.answer]);
      feedback("reveal", `<b>Let's look at it together.</b> The step that fails is <b>${esc(stepLabel(q.answer))}</b>. ${esc(q.explain)}`);
      // show part (b) answered too, so the scenario is complete
      renderQuestion(1);
      lockOptions(s.effectQuestion.answer, true);
      st.part = 1;
      feedback("reveal", `The muscle: <b>${esc(s.effectQuestion.answer)}</b>. ${esc(s.effectQuestion.explain)}`);
    } else {
      feedback("reveal", `<b>Let's look at it together.</b> The muscle: <b>${esc(q.answer)}</b>. ${esc(q.explain)}`);
    }
    App.toast("No points for this scenario. Read the explanation, then move on.", "info", 3500);
    finishScenario(true);
  }

  function finishScenario() {
    updateHint(true);
    progress(1);
    const last = st.idx >= WM.scenarios.length - 1;
    $("wm-next").textContent = last ? "Finish round 🏁" : "Next scenario ▶";
    $("wm-next").hidden = false;
    later(() => $("wm-next").scrollIntoView({ block: "nearest", behavior: "smooth" }), 150);
  }

  function next() {
    if (!st || st.done) return;
    if (st.idx >= WM.scenarios.length - 1) return finishRound();
    st.idx++;
    showScenario();
    window.scrollTo({ top: Math.max(0, $("screen-r3").offsetTop - 80), behavior: "smooth" });
  }

  function finishRound() {
    st.done = true;
    G.add("r3", P.r3Finish, $("wm-next"), "complete!");
    G.setProgress(1);
    $("wm-game").hidden = true;
    $("wm-restart").disabled = true;
    $("wm-hint").disabled = true;
    $("wm-summary").innerHTML = `<h3>🧩 All ${WM.scenarios.length} scenarios done!</h3>
      <p>Round 3 score: <b>${G.s.scores.r3 - r3AtStart}</b> pts · both parts right first time: <b>${st.perfect}</b> · wrong tries: <b>${st.totalWrong}</b> · hints: <b>${st.hints}</b> · explained for you: <b>${st.failed}</b></p>`;
    $("wm-done").hidden = false;
    App.confettiBurst();
    later(() => $("wm-done").scrollIntoView({ behavior: "smooth", block: "center" }), 200);
  }

  function progress(partFrac) {
    const f = partFrac === undefined ? 0 : partFrac;
    G.setProgress((st.idx + f) / WM.scenarios.length);
  }

  /* ---------------- hint / restart ---------------- */
  function updateHint(off) {
    const b = $("wm-hint");
    const can = !off && st && !st.done && $("wm-next").hidden && st.wrong >= WM.hintAfter && !st.hinted;
    b.disabled = !can;
    b.title = st && st.hinted ? "Hint already used for this question" : `Unlocks after ${WM.hintAfter} wrong tries`;
  }

  function hint() {
    if ($("wm-hint").disabled) return;
    st.hinted = true; st.hints++; G.s.hints++;
    G.add("r3", P.r3Hint, $("wm-hint"), "hint");
    feedback("hint", `<b>💡 Hint:</b> ${esc(question().hint)}`);
    updateHint();
  }

  function restart() {
    if (st && (st.idx > 0 || st.totalWrong > 0 || st.earned > 0) && !st.done &&
        !confirm("Restart Round 3 from scenario 1? Your points for this round will be reset.")) return;
    G.s.scores.r3 = r3AtStart;
    G.emit();
    start();
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("wm-hint").addEventListener("click", hint);
    $("wm-restart").addEventListener("click", restart);
    $("wm-next").addEventListener("click", next);
    $("wm-finish").addEventListener("click", () => App.go("qf"));
    $("wm-skip").addEventListener("click", () => { if (confirm("Skip Round 3? You'll score no further points for it.")) App.go("qf"); });
    // keyboard: A-D answers the current question
    document.addEventListener("keydown", (e) => {
      if ($("screen-r3").hidden || !st || st.done || !$("wm-next").hidden) return;
      const i = "ABCD".indexOf(e.key.toUpperCase());
      if (i < 0 || e.target.closest("input, textarea")) return;
      const b = $(st.part === 0 ? "wm-options-a" : "wm-options-b").querySelectorAll(".wm-opt")[i];
      if (b && !b.disabled) answer(b);
    });
  });

  window.Rounds = window.Rounds || {};
  window.Rounds.r3 = {
    start, stop,
    // test hooks (used by the automated test only)
    _debug: () => st && ({ idx: st.idx, part: st.part, wrong: st.wrong, done: st.done, answer: question() && String(question().answer), nextShown: !$("wm-next").hidden, hintEnabled: !$("wm-hint").disabled })
  };
})();
