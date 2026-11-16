/* APP — screen router, HUD, Partner Mode, toasts, confetti, results */
(function () {
  "use strict";
  const C = window.SARC_CONTENT, G = window.Game, P = G.POINTS;
  const $ = (id) => document.getElementById(id);
  const STEPS = ["r1", "r2", "r3", "qf", "results"];
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = "title", partnerOpen = false, logoRAF = null;

  const App = {
    go(name) {
      // stop timers/animations of whatever round we're leaving
      if (window.Rounds) Object.keys(Rounds).forEach((k) => { if (Rounds[k].stop) Rounds[k].stop(); });
      document.querySelectorAll(".screen").forEach((s) => (s.hidden = true));
      $("screen-" + name).hidden = false;
      current = name;
      const inGame = STEPS.includes(name) && name !== "results";
      $("hud").hidden = !(inGame || name === "results");
      document.body.classList.toggle("in-game", inGame);
      if (name !== "r3" && partnerOpen && !inGame) App.closePartner();
      window.scrollTo(0, 0);
      if (name === "title") { renderLeaderboard(); startLogo(); } else stopLogo();
      if (name === "examiner") Teacher.render();
      if (name === "results") showResults();
      else if (window.Rounds && Rounds[name]) Rounds[name].start();
      renderPartner();
      updateHUD();
      if (location.hash === "#examiner" && name !== "examiner") history.replaceState(null, "", location.pathname + location.search);
    },
    current: () => current,

    toast(msg, kind, ms) {
      const zone = $("toast-zone");
      const prev = zone.lastElementChild;
      if (prev && prev.textContent === msg && !prev.classList.contains("out")) { // don't stack duplicates — just re-pulse
        prev.classList.remove("pulse"); void prev.offsetWidth; prev.classList.add("pulse"); return;
      }
      const t = document.createElement("div");
      t.className = "toast " + (kind || "info");
      t.textContent = msg;
      zone.appendChild(t);
      while (zone.children.length > 2) zone.firstChild.remove();
      setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, ms || 2600);
    },

    openPartner() {
      partnerOpen = true;
      $("partner-panel").classList.add("open");
      $("partner-panel").setAttribute("aria-hidden", "false");
      $("btn-partner").setAttribute("aria-pressed", "true");
      document.body.classList.add("partner-open");
      renderPartner();
    },
    closePartner() {
      partnerOpen = false;
      $("partner-panel").classList.remove("open");
      $("partner-panel").setAttribute("aria-hidden", "true");
      $("btn-partner").setAttribute("aria-pressed", "false");
      document.body.classList.remove("partner-open");
    },

    confettiBurst(big) { confetti(big ? 220 : 70); }
  };
  window.App = App;

  /* ---------------- HUD ---------------- */
  function updateHUD() {
    const s = G.s;
    $("score-n").textContent = G.total();
    $("streak-n").textContent = s.streak;
    $("hud-streak").classList.toggle("hot", s.streak >= 3);
    $("hud-round").textContent = current === "results" ? "Results" : (G.ROUND_NAMES[current] || "");
    const ri = G.ROUNDS.indexOf(current);
    $("hud-count").textContent = ri >= 0 ? `Round ${ri + 1}/${G.ROUNDS.length}` : current === "results" ? "Done" : "";
    const idx = STEPS.indexOf(current);
    const frac = idx < 0 ? 0 : current === "results" ? 1 : (idx + (s.round === current ? s.roundProgress : 0)) / (STEPS.length - 1);
    $("progress-fill").style.width = (frac * 100).toFixed(1) + "%";
    document.querySelectorAll("#progress-steps li").forEach((li, i) => {
      li.classList.toggle("done", i < idx);
      li.classList.toggle("current", i === idx);
    });
  }
  G.onChange(updateHUD);

  /* ---------------- Partner Mode ---------------- */
  function renderPartner() {
    const key = C.partnerPrompts[current] ? current : null;
    const list = $("partner-list");
    if (!key) { list.innerHTML = "<li class='muted'>Prompts appear here during each round.</li>"; $("partner-pts").textContent = G.s.scores.partner; return; }
    list.innerHTML = C.partnerPrompts[key].map((p, i) => {
      const id = key + "-" + i;
      return `<li><label><input type="checkbox" data-id="${id}" ${G.s.partnerTicks[id] ? "checked" : ""}><span>${p}</span></label></li>`;
    }).join("");
    list.querySelectorAll("input").forEach((cb) => cb.addEventListener("change", () => {
      const id = cb.dataset.id;
      if (cb.checked) { G.s.partnerTicks[id] = true; G.add("partner", P.partnerTick, cb, "explained"); }
      else { delete G.s.partnerTicks[id]; G.add("partner", -P.partnerTick); }
      $("partner-pts").textContent = G.s.scores.partner;
    }));
    $("partner-pts").textContent = G.s.scores.partner;
  }

  /* ---------------- Results ---------------- */
  function showResults() {
    G.setRound("results", 1);
    const r = G.rating();
    $("res-emoji").textContent = r.emoji;
    $("res-player").textContent = G.s.player + ", you are a…";
    $("res-title").textContent = r.title;
    $("res-blurb").textContent = r.blurb;
    $("res-total").textContent = G.total();
    $("res-pct").textContent = `(${G.percent()}% of max)`;
    const sc = G.s.scores, mx = G.maxPoints();
    const row = (name, v, m) => `<tr><th>${name}</th><td>${v}</td><td><div class="mini-bar"><i style="width:${m ? Math.max(0, Math.min(100, 100 * v / m)) : 0}%"></i></div></td></tr>`;
    $("res-table").innerHTML =
      row("Sequence Sort", sc.r1, mx.r1) + row("Build the Sarcomere", sc.r2, mx.r2) +
      row("What's Missing?", sc.r3, mx.r3) + row("Quick-fire", sc.qf, mx.qf) +
      `<tr><th>Partner explanations</th><td>${sc.partner}</td><td class="muted">bonus</td></tr>`;
    const q = Rounds.qf._stats();
    $("res-stats").innerHTML =
      `<span>🔥 Best streak <b>${G.s.bestStreak}</b></span><span>✔ Correct actions <b>${G.s.correct}</b></span>` +
      `<span>✘ Mistakes <b>${G.s.mistakes}</b></span><span>💡 Hints <b>${G.s.hints}</b></span>` +
      (q.total ? `<span>❓ Quick-fire <b>${q.right}/${q.total}</b></span>` : "");
    const place = G.saveResult();
    if (place === 0) App.toast("🥇 New station high score!", "good", 3500);
    App.closePartner();
    sizeCanvas();
    confetti(260);
  }

  function renderLeaderboard() {
    const lb = G.leaderboard();
    $("leaderboard").innerHTML = lb.length
      ? lb.map((e, i) => `<li><span class="lb-rank">${["🥇", "🥈", "🥉"][i] || i + 1}</span><span class="lb-name">${String(e.name).replace(/[<>&]/g, "")}</span><span class="lb-rating">${e.rating}</span><b>${e.score}</b></li>`).join("")
      : "<li class='muted'>No scores yet. Be the first!</li>";
  }

  /* ---------------- Title logo animation ---------------- */
  function startLogo() {
    const svg = $("logo-svg");
    if (!svg.firstChild) {
      const d = Object.assign({}, C.dimensions);
      svg._s = SarcSVG.sarcomere(svg, d, 150, { noNeighbours: false });
      svg._d = d;
    }
    const s = svg._s, d = svg._d;
    stopLogo();
    if (reduceMotion) { s.update(d.relaxedSL * 150); return; }
    const t0 = performance.now();
    const tick = (t) => {
      const k = (1 - Math.cos((t - t0) / 900)) / 2; // 0..1
      s.update((d.relaxedSL - k * (d.relaxedSL - d.contractedSL)) * 150);
      logoRAF = requestAnimationFrame(tick);
    };
    logoRAF = requestAnimationFrame(tick);
  }
  function stopLogo() { if (logoRAF) cancelAnimationFrame(logoRAF); logoRAF = null; }

  /* ---------------- Confetti ---------------- */
  let parts = [], confRAF = null;
  function sizeCanvas() { const c = $("confetti"); c.width = innerWidth; c.height = innerHeight; }
  function confetti(n) {
    if (reduceMotion) return;
    const c = $("confetti");
    c.hidden = false; sizeCanvas();
    const colors = ["#ff6b6b", "#37d6c4", "#ffc53d", "#b794ff", "#7ee081", "#ffffff"];
    for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + (Math.random() - .5) * innerWidth * .6, y: innerHeight * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: colors[i % colors.length], life: 0 });
    if (!confRAF) confRAF = requestAnimationFrame(drawConfetti);
  }
  function drawConfetti() {
    const c = $("confetti"), ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    parts.forEach((p) => {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
    });
    parts = parts.filter((p) => p.y < c.height + 20 && p.life < 400);
    confRAF = parts.length ? requestAnimationFrame(drawConfetti) : null;
    if (!parts.length) ctx.clearRect(0, 0, c.width, c.height);
  }

  /* ---------------- Wire up ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    // the confetti canvas lives in the results screen markup; move it to <body> so it works everywhere
    document.body.appendChild($("confetti"));
    document.title = C.settings.title;

    const prefs = G.prefs();
    if (prefs.timed) $("opt-timer").checked = true;

    $("start-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("player-name").value.trim() || "Player";
      G.start(name, $("opt-timer").checked);
      G.setPrefs({ timed: $("opt-timer").checked });
      App.go("r1");
    });
    $("btn-howto").addEventListener("click", () => { const d = $("howto"); if (d.showModal) d.showModal(); else d.setAttribute("open", ""); });
    $("btn-examiner").addEventListener("click", () => App.go("examiner"));
    $("ex-back").addEventListener("click", () => App.go("title"));
    $("ex-print").addEventListener("click", () => window.print());
    $("btn-home").addEventListener("click", () => {
      if (current === "results" || confirm("Quit to the title screen? This game's progress will be lost.")) App.go("title");
    });
    $("btn-partner").addEventListener("click", () => (partnerOpen ? App.closePartner() : App.openPartner()));
    $("partner-close").addEventListener("click", App.closePartner);
    $("res-again").addEventListener("click", () => { $("player-name").value = ""; App.go("title"); setTimeout(() => $("player-name").focus(), 50); });
    window.addEventListener("resize", () => { if (confRAF) sizeCanvas(); });

    App.go(location.hash === "#examiner" ? "examiner" : "title");
  });
})();
