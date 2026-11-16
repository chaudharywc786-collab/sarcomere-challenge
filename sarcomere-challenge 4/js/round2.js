/* ROUND 2 — Build the Sarcomere (relaxed) + label the bands */
(function () {
  "use strict";
  const C = window.SARC_CONTENT, G = window.Game, P = G.POINTS, D = C.dimensions;
  const S = 260;              // SVG units per micrometre
  const CX = 500, CY = 170;   // centre of the build area
  const el = SarcSVG.el;
  const $ = (id) => document.getElementById(id);

  const KIND_TIPS = {
    z: "Z discs form the boundaries (both ends) of the sarcomere.",
    thin: "Thin (actin) filaments are anchored to a Z disc and point in toward the centre.",
    thick: "The thick (myosin) filament sits in the centre of the sarcomere, held at the M line.",
    m: "The M line marks the very centre of the sarcomere."
  };
  const KIND_NAMES = { z: "Z disc", thin: "Thin filaments (actin)", thick: "Thick filament (myosin)", m: "M line" };

  let svg, piecesLayer, socketLayer, labelLayer, pieces, sockets, phase, firstCheck, awarded, labelsDone, selectedChip, wrongAtCheck;

  function geometry() {
    const h = D.relaxedSL * S / 2;
    return {
      zL: CX - h, zR: CX + h,
      thin: D.thin * S, thick: D.thick * S,
      thickL: CX - D.thick * S / 2, thickR: CX + D.thick * S / 2,
      thinEndL: CX - h + D.thin * S, thinEndR: CX + h - D.thin * S
    };
  }

  let run = 0; // bumps on every start/stop so stale timers do nothing
  function start() {
    run++;
    G.setRound("r2", 0);
    svg = $("r2-svg");
    svg.innerHTML = "";
    svg.setAttribute("viewBox", "0 0 1000 760");
    phase = "build"; firstCheck = true; awarded = {}; labelsDone = {}; selectedChip = null; wrongAtCheck = 0;
    $("r2-feedback").innerHTML = "";
    $("r2-check").hidden = false; $("r2-check").disabled = false;
    $("r2-next").hidden = true;
    $("r2-reset").disabled = false;
    $("r2-labels").hidden = true; $("r2-labels").innerHTML = "";
    $("r2-instructions").innerHTML = "Drag the pieces onto the glowing sockets to build a <b>RELAXED</b> sarcomere. Careful: not every piece belongs!";
    const g = geometry();

    // backgrounds
    el("rect", { x: 10, y: 20, width: 980, height: 290, rx: 22, class: "build-area" }, svg);
    const t1 = el("text", { x: 30, y: 50, class: "area-title" }, svg); t1.textContent = "BUILD AREA";
    el("rect", { x: 10, y: 325, width: 980, height: 425, rx: 22, class: "tray-area", id: "r2-tray-bg" }, svg);
    const t2 = el("text", { x: 30, y: 355, class: "area-title", id: "r2-tray-title" }, svg); t2.textContent = "PARTS BIN · drag pieces up";
    // scale bar
    const sb = el("g", { class: "scale-bar" }, svg);
    el("line", { x1: 860, y1: 295, x2: 860 + S * 0.5, y2: 295 }, sb);
    const sbt = el("text", { x: 860 + S * 0.25, y: 288, "text-anchor": "middle" }, sb); sbt.textContent = "0.5 µm";

    socketLayer = el("g", { class: "sockets" }, svg);
    labelLayer = el("g", { class: "label-layer" }, svg);
    piecesLayer = el("g", { class: "pieces" }, svg);

    sockets = [
      { id: "zL", kind: "z", x: g.zL, y: CY },
      { id: "zR", kind: "z", x: g.zR, y: CY },
      { id: "thinL", kind: "thin", x: g.zL + g.thin / 2, y: CY, side: -1 },
      { id: "thinR", kind: "thin", x: g.zR - g.thin / 2, y: CY, side: 1 },
      { id: "thick", kind: "thick", x: CX, y: CY },
      { id: "m", kind: "m", x: CX, y: CY }
    ];
    sockets.forEach((s) => {
      s.piece = null;
      const mk = el("g", { class: "socket", transform: `translate(${s.x},${s.y})` }, socketLayer);
      el("circle", { r: s.kind === "m" ? 12 : 22, class: "socket-ring" }, mk);
      s.marker = mk;
    });

    // pieces: correct + decoys, with randomised tray spots
    const defs = [
      { id: "z1", kind: "z" }, { id: "z2", kind: "z" }, { id: "m", kind: "m" },
      { id: "thin1", kind: "thin", length: D.thin }, { id: "thin2", kind: "thin", length: D.thin },
      { id: "thick", kind: "thick", length: D.thick }
    ];
    C.decoys.forEach((d) => defs.push({ id: d.id, kind: d.kind, length: d.length, decoy: d }));

    const thickSpots = shuffle([{ x: 235, y: 440 }, { x: 635, y: 440 }]);
    const thinSpots = shuffle([{ x: 165, y: 650 }, { x: 465, y: 650 }, { x: 800, y: 650 }]);
    const otherSpots = [{ x: 885, y: 440 }, { x: 935, y: 440 }, { x: 970, y: 440 }];
    pieces = defs.map((d) => {
      const home = d.kind === "thick" ? thickSpots.shift() : d.kind === "thin" ? thinSpots.shift() : otherSpots.shift();
      const gEl = el("g", { class: "piece kind-" + d.kind, tabindex: 0, "aria-label": (d.decoy ? d.decoy.name : KIND_NAMES[d.kind]) }, piecesLayer);
      if (d.kind === "z") SarcSVG.zDisc(gEl);
      else if (d.kind === "m") SarcSVG.mLine(gEl);
      else if (d.kind === "thin") SarcSVG.thinSet(d.length * S, gEl);
      else SarcSVG.thickSet(d.length * S, D.bareZone * S, gEl);
      const p = Object.assign({ el: gEl, home, x: home.x, y: home.y, socket: null }, d);
      moveTo(p, home.x, home.y, false);
      Drag.svg(gEl, svg, {
        enabled: () => phase === "build",
        getPos: () => ({ x: p.x, y: p.y }),
        onStart: () => { piecesLayer.appendChild(gEl); if (p.socket) { p.socket.piece = null; p.socket = null; } highlightSockets(p.kind); },
        onMove: (x, y) => moveTo(p, x, y, false),
        onEnd: (x, y, moved) => { highlightSockets(null); drop(p, x, y, moved); }
      });
      return p;
    });
    updateProgress();
  }

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function moveTo(p, x, y, animate) {
    p.x = x; p.y = y;
    p.el.classList.toggle("animate", !!animate);
    p.el.style.transform = `translate(${x}px, ${y}px)`;
  }

  function highlightSockets(kind) {
    sockets.forEach((s) => s.marker.classList.toggle("active", !!kind && !s.piece));
  }

  function drop(p, x, y, moved) {
    if (!moved) { // a tap: if it's in the tray, give a quick description
      if (!p.socket) App.toast((p.decoy ? p.decoy.name : KIND_NAMES[p.kind]) + (p.length ? ` · ${p.length.toFixed(2)} µm long` : ""), "info");
      return;
    }
    // nearest socket within reach
    let best = null, bestD = 1e9;
    sockets.forEach((s) => {
      const d = Math.hypot(x - s.x, (y - s.y) * 1.3);
      if (d < bestD) { bestD = d; best = s; }
    });
    if (!best || bestD > 120) {
      if (y < 315) App.toast("Drop it closer to a glowing socket.", "info");
      return moveTo(p, p.home.x, p.home.y, true);
    }
    // the centre has two sockets (thick + M line): prefer the one that matches
    if (best.kind !== p.kind) {
      const alt = sockets.find((s) => s.kind === p.kind && Math.hypot(x - s.x, (y - s.y) * 1.3) < 120);
      if (alt) best = alt;
    }
    if (best.kind !== p.kind) {
      G.wrong("r2", 0);
      shake(p.el);
      App.toast("Not there! " + KIND_TIPS[p.kind], "bad");
      return moveTo(p, p.home.x, p.home.y, true);
    }
    if (best.piece) {
      // swap to the matching empty twin socket if there is one (e.g. other Z disc)
      const twin = sockets.find((s) => s.kind === p.kind && !s.piece);
      if (!twin) { App.toast("That socket is already filled.", "info"); return moveTo(p, p.home.x, p.home.y, true); }
      best = twin;
    }
    snap(p, best);
  }

  function snap(p, s) {
    s.piece = p; p.socket = s;
    let x = s.x;
    if (p.kind === "thin") { // attach the filament's end to the Z disc
      const g = geometry(), len = p.length * S;
      x = s.side === -1 ? g.zL + len / 2 : g.zR - len / 2;
    }
    moveTo(p, x, s.y, true);
    p.el.classList.remove("snapped"); void p.el.getBBox(); p.el.classList.add("snapped");
    updateProgress();
  }

  function shake(node) { node.classList.remove("svg-shake"); void node.getBBox(); node.classList.add("svg-shake"); }

  function updateProgress() {
    const filled = sockets.filter((s) => s.piece).length;
    G.setProgress(phase === "build" ? filled / 12 : 0.5 + Object.keys(labelsDone).length / 8);
  }

  function reset() {
    if (phase !== "build") return;
    pieces.forEach((p) => { if (p.socket) { p.socket.piece = null; p.socket = null; } moveTo(p, p.home.x, p.home.y, true); });
    $("r2-feedback").innerHTML = "";
    updateProgress();
  }

  /* ---------------- CHECK BUILD ---------------- */
  function check() {
    if (phase !== "build") return;
    const fb = [];
    let allGood = true;
    sockets.forEach((s) => {
      const p = s.piece;
      if (!p) { allGood = false; fb.push({ ok: false, text: `Missing: ${KIND_NAMES[s.kind]}${s.kind === "z" || s.kind === "thin" ? (s.id.endsWith("L") ? " (left)" : " (right)") : ""}.` }); return; }
      if (p.decoy) {
        allGood = false; wrongAtCheck++;
        fb.push({ ok: false, text: p.decoy.feedback });
        G.wrong("r2", P.r2PieceWrong, p.el);
        shake(p.el);
        const pp = p, myRun = run; setTimeout(() => { if (myRun !== run || !pp.socket) return; pp.socket.piece = null; pp.socket = null; moveTo(pp, pp.home.x, pp.home.y, true); updateProgress(); }, 700);
        return;
      }
      if (!awarded[s.id]) { awarded[s.id] = true; G.add("r2", P.r2Piece); }
      fb.push({ ok: true, text: `${KIND_NAMES[s.kind]} ✓` });
    });
    if (allGood) {
      fb.unshift({ ok: true, text: "🎉 Correct relaxed sarcomere! Notice the gap between the thin filaments in the middle: that's the H zone." });
      if (firstCheck && wrongAtCheck === 0) { G.add("r2", P.r2Perfect, $("r2-check"), "first try!"); }
      else G.popup("Built!", $("r2-check"), "good");
      startLabels();
      renderFeedback(fb.slice(0, 1));
      return;
    }
    firstCheck = false;
    renderFeedback(fb);
  }

  function renderFeedback(list) {
    $("r2-feedback").innerHTML = list.map((f) => `<div class="fb ${f.ok ? "ok" : "no"}"><span>${f.ok ? "✔" : "✘"}</span> ${f.text}</div>`).join("");
  }

  /* ---------------- LABEL PHASE ---------------- */
  function startLabels() {
    phase = "label";
    $("r2-check").hidden = true;
    $("r2-reset").disabled = true;
    $("r2-instructions").innerHTML = "Now <b>label it</b>: drag each label onto the matching box (or tap a label, then tap a box).";
    // fade unused decoys + tray
    pieces.forEach((p) => { if (!p.socket) p.el.classList.add("benched"); });
    $("r2-tray-bg").classList.add("benched"); $("r2-tray-title").textContent = "";
    svg.setAttribute("viewBox", "0 0 1000 490"); // crop away the empty parts bin so labels sit right under the diagram
    sockets.forEach((s) => s.marker.classList.add("hidden"));

    const g = geometry();
    const L = labelLayer;
    SarcSVG.bracket(g.zL, g.thickL, 305, L, "br-I");
    SarcSVG.bracket(g.thinEndL, g.thinEndR, 305, L, "br-H");
    el("line", { x1: g.thickL, y1: CY + 40, x2: g.thickL, y2: 405, class: "leader" }, L);
    el("line", { x1: g.thickR, y1: CY + 40, x2: g.thickR, y2: 405, class: "leader" }, L);
    SarcSVG.bracket(g.thickL, g.thickR, 405, L, "br-A");
    el("line", { x1: CX, y1: 58, x2: CX, y2: CY - 62, class: "leader" }, L);

    const targets = [
      { key: "I", x: (g.zL + g.thickL) / 2, y: 345 },
      { key: "H", x: CX, y: 345 },
      { key: "A", x: CX, y: 450 },
      { key: "M", x: CX, y: 36 }
    ];
    targets.forEach((t) => {
      const tg = el("g", { class: "label-target", "data-drop": "label", "data-label": t.key, transform: `translate(${t.x},${t.y})`, tabindex: 0, role: "button", "aria-label": "Label box" }, L);
      el("rect", { x: -70, y: -22, width: 140, height: 44, rx: 12 }, tg);
      const tx = el("text", { "text-anchor": "middle", y: 7 }, tg); tx.textContent = "?";
      tg.addEventListener("click", () => { if (selectedChip) placeLabel(selectedChip, tg); });
      tg.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && selectedChip) { e.preventDefault(); placeLabel(selectedChip, tg); } });
    });

    const tray = $("r2-labels");
    tray.hidden = false;
    tray.innerHTML = "<span class='label-tray-title'>Labels:</span>";
    shuffle(["A", "I", "H", "M"]).forEach((k) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "label-chip"; b.dataset.key = k; b.textContent = C.labels[k].name;
      tray.appendChild(b);
      Drag.html(b, {
        enabled: () => !b.disabled,
        onDrop: (target) => target.dataset.label ? placeLabel(b, target) : false,
        onTap: () => selectChip(selectedChip === b ? null : b)
      });
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectChip(selectedChip === b ? null : b); } });
    });
    updateProgress();
  }

  function selectChip(b) {
    if (selectedChip) selectedChip.classList.remove("selected");
    selectedChip = b;
    if (b) b.classList.add("selected");
    labelLayer.classList.toggle("awaiting", !!b);
  }

  function placeLabel(chip, target) {
    const key = chip.dataset.key, want = target.dataset.label;
    selectChip(null);
    if (labelsDone[want]) { App.toast("That box is already labelled.", "info"); return false; }
    if (key === want) {
      labelsDone[want] = true;
      target.classList.add("done");
      target.querySelector("text").textContent = C.labels[key].name;
      chip.disabled = true; chip.classList.add("used");
      G.correct("r2", P.r2Label, chip);
      $("r2-feedback").insertAdjacentHTML("afterbegin", `<div class="fb ok"><span>✔</span> ${C.labels[key].info}</div>`);
      updateProgress();
      if (Object.keys(labelsDone).length === 4) finish();
      return true;
    }
    chip.classList.remove("shake"); void chip.offsetWidth; chip.classList.add("shake");
    target.classList.remove("bad"); void target.getBBox(); target.classList.add("bad");
    setTimeout(() => target.classList.remove("bad"), 700);
    G.wrong("r2", P.r2LabelWrong, chip);
    App.toast(`Not the ${C.labels[key].name}. Hint: ${C.labels[key].info}`, "bad", 4200);
    return false;
  }

  function finish() {
    phase = "done";
    G.setProgress(1);
    $("r2-labels").hidden = true;
    $("r2-instructions").innerHTML = "🎉 Sarcomere built and labelled! Remember these widths — you're about to change some of them.";
    renderFeedback([
      { ok: true, text: `A band = thick filament = ${D.thick.toFixed(2)} µm` },
      { ok: true, text: `I band = ${(D.relaxedSL - D.thick).toFixed(2)} µm in total (${((D.relaxedSL - D.thick) / 2).toFixed(2)} µm each side of the sarcomere; the band continues across the Z disc into the next sarcomere)` },
      { ok: true, text: `H zone = ${(D.relaxedSL - 2 * D.thin).toFixed(2)} µm (thick filament only)` },
      { ok: true, text: `Sarcomere length = ${D.relaxedSL.toFixed(2)} µm (Z disc to Z disc)` }
    ]);
    $("r2-next").hidden = false;
    App.confettiBurst();
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("r2-check").addEventListener("click", check);
    $("r2-reset").addEventListener("click", reset);
    $("r2-next").addEventListener("click", () => App.go("r3"));
    $("r2-skip").addEventListener("click", () => { if (confirm("Skip Round 2? You'll score no further points for it.")) App.go("r3"); });
  });

  window.Rounds = window.Rounds || {};
  window.Rounds.r2 = {
    start, stop: () => { run++; },
    // test hooks (used by the automated test only)
    _debug: () => ({ phase, sockets: sockets.map((s) => ({ id: s.id, piece: s.piece && s.piece.id })), pieces: pieces.map((p) => ({ id: p.id, x: p.x, y: p.y, home: p.home })) })
  };
})();
