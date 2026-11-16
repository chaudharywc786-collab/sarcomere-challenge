/* EXAMINER VIEW — answer key generated from content.js */
(function () {
  "use strict";
  const C = window.SARC_CONTENT, G = window.Game, P = G.POINTS, D = C.dimensions;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function diagram(SL, title) {
    const S = 260, CX = 400, CY = 140;
    const wrap = document.createElement("figure");
    wrap.className = "ex-diagram";
    const svg = SarcSVG.el("svg", { viewBox: "0 0 800 300", role: "img", "aria-label": title });
    wrap.appendChild(svg);
    const g = SarcSVG.el("g", { transform: `translate(${CX},${CY})` }, svg);
    const s = SarcSVG.sarcomere(g, D, S);
    s.update(SL * S);
    const m = SarcSVG.measures(SL, D);
    const h = SL * S / 2, tL = CX - D.thick * S / 2, tR = CX + D.thick * S / 2;
    SarcSVG.bracket(tL, tR, 22, svg, "br-A", "A band " + m.A.toFixed(2) + " µm", 18);
    SarcSVG.bracket(CX - h, tL, 262, svg, "br-I", "½ I " + (m.I / 2).toFixed(2), 24);
    SarcSVG.bracket(tR, CX + h, 262, svg, "br-I", "½ I " + (m.I / 2).toFixed(2), 24);
    if (m.H > 0.005) SarcSVG.bracket(CX - m.H * S / 2, CX + m.H * S / 2, 262, svg, "br-H", "H " + m.H.toFixed(2), 24);
    const cap = document.createElement("figcaption");
    cap.innerHTML = `<b>${title}</b> · Sarcomere ${m.SL.toFixed(2)} µm · A ${m.A.toFixed(2)} · I ${m.I.toFixed(2)} · H ${m.H.toFixed(2)} µm`;
    wrap.appendChild(cap);
    return wrap;
  }

  function render() {
    const body = document.getElementById("examiner-body");
    body.innerHTML = "";
    const sec = (title, html) => { const s = document.createElement("section"); s.className = "ex-sec"; s.innerHTML = `<h2>${title}</h2>` + (html || ""); body.appendChild(s); return s; };

    sec("Round 1 · Correct contraction sequence",
      "<ol class='ex-seq'>" + C.sequence.map((s) => `<li><b>${esc(s.short)}</b><br><span class="muted">${esc(s.detail)}</span></li>`).join("") + "</ol>");

    const r2 = sec("Round 2 · Sarcomere answer key",
      `<p>Thick filament ${D.thick} µm (= A band) · thin filament ${D.thin} µm from each Z disc. Decoy pieces in Round 2: ` +
      C.decoys.map((d) => `<i>${esc(d.name)} ${d.length} µm</i>`).join(", ") + ".</p>");
    const dg = document.createElement("div"); dg.className = "ex-diagrams";
    dg.appendChild(diagram(D.relaxedSL, "Relaxed"));
    dg.appendChild(diagram(D.contractedSL, "Fully contracted"));
    r2.appendChild(dg);
    r2.insertAdjacentHTML("beforeend",
      `<table class="mini-table"><thead><tr><th>Structure</th><th>Contains</th><th>During contraction</th></tr></thead><tbody>
      <tr><td>A band</td><td>Whole thick filament (incl. overlap)</td><td>Same length</td></tr>
      <tr><td>I band</td><td>Thin filaments only (spans the Z disc)</td><td>Shortens</td></tr>
      <tr><td>H zone</td><td>Thick filament only (centre of A band)</td><td>Shortens / disappears</td></tr>
      <tr><td>M line</td><td>Centre of sarcomere; anchors thick filaments</td><td>Stays central</td></tr>
      <tr><td>Z disc</td><td>Boundary; anchors thin filaments</td><td>Move closer together</td></tr>
      <tr><td>Sarcomere</td><td>Z disc to Z disc</td><td>Shortens</td></tr></tbody></table>`);

    const WM = C.whatsMissing;
    const stepTxt = (n) => `Step ${n}: ${esc(C.sequence[n - 1].short)}`;
    sec("Round 3 · What's Missing? answer key",
      `<p>Muscle responses offered: ${WM.effects.map(esc).join(" · ")}. <span class="muted">${esc(WM.effectGuide)}</span></p><ol class='ex-seq'>` +
      WM.scenarios.map((s) => `<li><b>${esc(s.icon || "")} ${esc(s.missing)}</b><br>
        (a) Fails at <b>${stepTxt(s.stepQuestion.answer)}</b> <span class="muted">(other options: ${s.stepQuestion.options.filter((o) => o !== s.stepQuestion.answer).join(", ")})</span><br>
        <span class="muted">${esc(s.stepQuestion.explain)}</span><br>
        (b) Muscle: <b>${esc(s.effectQuestion.answer)}</b><br><span class="muted">${esc(s.effectQuestion.explain)}</span></li>`).join("") +
      "</ol>");

    sec("Quick-fire · Question bank (" + C.questions.length + " questions; correct answer in green)",
      "<ol class='ex-q'>" + C.questions.map((q) => `<li><span class="tag">${esc(q.topic)}</span> <b>${esc(q.q)}</b><ul>` +
        q.options.map((o, i) => `<li class="${i === q.answer ? "ans" : ""}">${i === q.answer ? "✔ " : ""}${esc(o)}</li>`).join("") +
        `</ul><p class="muted">${esc(q.explain)}</p></li>`).join("") + "</ol>");

    sec("Partner Mode checklist",
      Object.keys(C.partnerPrompts).map((k) => `<h3>${G.ROUND_NAMES[k]}</h3><ul class="ex-check">` + C.partnerPrompts[k].map((p) => `<li>☐ ${esc(p)}</li>`).join("") + "</ul>").join(""));

    sec("Scoring",
      `<ul>
        <li>Round 1: +${P.r1Correct} per correct card, ${P.r1Wrong} per wrong drop, ${P.r1Hint} per hint, +${P.r1Perfect} for a perfect run (no mistakes or hints)</li>
        <li>Round 2: +${P.r2Piece} per correct piece, ${P.r2PieceWrong} per decoy found at check, +${P.r2Label} per label (${P.r2LabelWrong} if wrong), +${P.r2Perfect} for a correct build on the first check</li>
        <li>Round 3: +${P.r3First} per answer right first time, +${P.r3Later} if right after a wrong try, no penalty for a wrong try (the streak resets), ${P.r3Hint} per hint (unlocks after ${C.whatsMissing.hintAfter} wrong tries), no points for a scenario after ${C.whatsMissing.revealAfter} wrong tries on one question, +${P.r3Finish} on completion</li>
        <li>Quick-fire: +${P.qfCorrect} per correct answer, up to +${P.qfSpeedMax} speed bonus (timed mode) and up to +${P.qfStreakMax} streak bonus</li>
        <li>🔥 Streaks of 3+ add up to +${P.streakCap} per correct action · 👥 Partner Mode: +${P.partnerTick} per ticked explanation</li>
        <li>Ratings: ${C.ratings.map((r) => `${r.emoji} ${esc(r.title)} ≥ ${r.min}%`).join(" · ")}</li>
      </ul>
      <button class="pill-btn danger" id="ex-clear">🗑 Clear station leaderboard</button>`);

    document.getElementById("ex-clear").addEventListener("click", () => {
      if (confirm("Delete all saved scores on this device?")) { G.clearLeaderboard(); App.toast("Leaderboard cleared.", "info"); }
    });
  }

  window.Teacher = { render };
})();
