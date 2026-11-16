/* SVG drawing helpers for sarcomere parts. Exposes window.SarcSVG.
   All parts are drawn centred on (0,0) so they can be positioned with a
   translate(). Lengths are in SVG user units (px). */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const THIN_Y = [-66, 0, 66];
  const THICK_Y = [-33, 33];

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function thinSet(len, parent, rowHits) {
    const g = el("g", { class: "part thin-set" }, parent);
    THIN_Y.forEach((y) => {
      el("line", { x1: -len / 2, y1: y, x2: len / 2, y2: y, class: "actin-core" }, g);
      el("line", { x1: -len / 2 + 4, y1: y - 3, x2: len / 2 - 4, y2: y - 3, class: "actin-bead" }, g);
      el("line", { x1: -len / 2 + 9, y1: y + 3, x2: len / 2 - 4, y2: y + 3, class: "actin-bead b2" }, g);
    });
    // invisible hit-area so it's easy to grab on touch. rowHits = one strip per filament
    // (used when assembled, so the thick filament between the rows stays reachable)
    if (rowHits) THIN_Y.forEach((y) => el("rect", { x: -len / 2, y: y - 15, width: len, height: 30, class: "hit" }, g));
    else el("rect", { x: -len / 2, y: -90, width: len, height: 180, class: "hit" }, g);
    return g;
  }

  function thickSet(len, bareHalf, parent) {
    const g = el("g", { class: "part thick-set" }, parent);
    THICK_Y.forEach((y) => {
      el("rect", { x: -len / 2, y: y - 6, width: len, height: 12, rx: 6, class: "myosin-core" }, g);
      for (let x = -len / 2 + 10; x <= len / 2 - 10; x += 20) {
        if (Math.abs(x) < bareHalf) continue;
        const dir = x < 0 ? -1 : 1; // heads lean away from the M line
        [-1, 1].forEach((side) => {
          el("line", { x1: x, y1: y + side * 6, x2: x + dir * 7, y2: y + side * 15, class: "myosin-head" }, g);
          el("circle", { cx: x + dir * 8, cy: y + side * 16, r: 3.2, class: "myosin-tip" }, g);
        });
      }
    });
    el("rect", { x: -len / 2, y: -60, width: len, height: 120, class: "hit" }, g);
    return g;
  }

  function zDisc(parent) {
    const g = el("g", { class: "part z-disc" }, parent);
    const pts = [];
    for (let i = 0, y = -105; y <= 105; y += 15, i++) pts.push(((i % 2) ? 7 : -7) + "," + y);
    el("polyline", { points: pts.join(" "), class: "z-line" }, g);
    el("rect", { x: -22, y: -112, width: 44, height: 224, class: "hit" }, g);
    return g;
  }

  function mLine(parent) {
    const g = el("g", { class: "part m-line" }, parent);
    el("line", { x1: 0, y1: -58, x2: 0, y2: 58, class: "m-stroke" }, g);
    el("rect", { x: -18, y: -64, width: 36, height: 128, class: "hit" }, g);
    return g;
  }

  /* Horizontal measurement bracket with end ticks */
  function bracket(x1, x2, y, parent, cls, text, textDy) {
    const g = el("g", { class: "bracket " + (cls || "") }, parent);
    el("line", { x1, y1: y, x2, y2: y }, g);
    el("line", { x1, y1: y - 8, x2: x1, y2: y + 8 }, g);
    el("line", { x1: x2, y1: y - 8, x2, y2: y + 8 }, g);
    if (text) {
      const t = el("text", { x: (x1 + x2) / 2, y: y + (textDy || -12), "text-anchor": "middle" }, g);
      t.textContent = text;
    }
    return g;
  }

  /* Draw a full sarcomere into <g>. Returns an updater: update(SLpx). */
  function sarcomere(parent, d, S, opts) {
    opts = opts || {};
    const thickLen = d.thick * S, thinLen = d.thin * S;
    const root = el("g", { class: "sarcomere" }, parent);
    const ghosts = el("g", { class: "neighbour" }, root);
    // faded thin filaments from the neighbouring sarcomeres (shows that the I band spans the Z disc)
    const nL = thinSet(thinLen * 0.35, ghosts), nR = thinSet(thinLen * 0.35, ghosts);
    const thick = thickSet(thickLen, d.bareZone * S, root);
    const thinL = thinSet(thinLen, root, true), thinR = thinSet(thinLen, root, true);
    const m = mLine(root);
    const zL = zDisc(root), zR = zDisc(root);
    if (opts.noNeighbours) ghosts.remove();
    function update(SLpx) {
      const h = SLpx / 2;
      const tx = (n, x) => { n.style.transform = `translate(${x}px, 0px)`; };
      tx(zL, -h); tx(zR, h);
      tx(thinL, -h + thinLen / 2); tx(thinR, h - thinLen / 2);
      tx(nL, -h - thinLen * 0.175); tx(nR, h + thinLen * 0.175);
    }
    return { root, thick, thinL, thinR, zL, zR, m, update };
  }

  /* Pure geometry (µm) for a given sarcomere length */
  function measures(SL, d) {
    return {
      SL,
      A: d.thick,
      I: Math.max(0, SL - d.thick),
      H: Math.max(0, SL - 2 * d.thin),
      overlap: Math.max(0, (d.thick - Math.max(0, SL - 2 * d.thin)) / 2) // per half-sarcomere
    };
  }

  window.SarcSVG = { el, thinSet, thickSet, zDisc, mLine, bracket, sarcomere, measures, THIN_Y, THICK_Y };
})();
