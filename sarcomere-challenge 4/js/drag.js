/* Shared pointer-based drag helpers (mouse + touch + pen).
   Exposes window.Drag.
   - Drag.html(el, opts): drag an HTML element as a floating "ghost" and drop it
     on any element with [data-drop]. Tap without moving -> opts.onTap.
   - Drag.svg(el, svg, opts): drag an SVG <g> in SVG user units.
*/
(function () {
  "use strict";
  const THRESHOLD = 6; // px of movement before a press becomes a drag

  function autoScroll(clientY) {
    const edge = 70, speed = 14;
    if (clientY < edge) window.scrollBy(0, -speed);
    else if (clientY > window.innerHeight - edge) window.scrollBy(0, speed);
  }

  function dropTargetAt(x, y) {
    const hit = document.elementFromPoint(x, y);
    return hit ? hit.closest("[data-drop]") : null;
  }

  /* ---------------- HTML element dragging ---------------- */
  function html(el, opts) {
    let start = null, ghost = null, offset = null, lastTarget = null, pid = null;

    function clearHover() { if (lastTarget) lastTarget.classList.remove("drop-hover"); lastTarget = null; }

    el.addEventListener("pointerdown", (e) => {
      if (e.button !== undefined && e.button > 0) return;
      if (opts.enabled && !opts.enabled()) return;
      start = { x: e.clientX, y: e.clientY };
      pid = e.pointerId;
      try { el.setPointerCapture(pid); } catch (_) {}
    });

    el.addEventListener("pointermove", (e) => {
      if (!start || e.pointerId !== pid) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!ghost) {
        if (Math.hypot(dx, dy) < THRESHOLD) return;
        const r = el.getBoundingClientRect();
        offset = { x: start.x - r.left, y: start.y - r.top };
        ghost = el.cloneNode(true);
        ghost.removeAttribute("id");
        ghost.classList.add("drag-ghost");
        ghost.style.width = r.width + "px";
        ghost.style.height = r.height + "px";
        document.body.appendChild(ghost);
        el.classList.add("drag-source");
        if (opts.onStart) opts.onStart();
      }
      ghost.style.transform = `translate(${e.clientX - offset.x}px, ${e.clientY - offset.y}px) rotate(-2deg) scale(1.04)`;
      autoScroll(e.clientY);
      const t = dropTargetAt(e.clientX, e.clientY);
      if (t !== lastTarget) { clearHover(); if (t) { t.classList.add("drop-hover"); lastTarget = t; } }
      e.preventDefault();
    });

    function finish(e, cancelled) {
      if (!start || e.pointerId !== pid) return;
      const wasDrag = !!ghost;
      start = null;
      try { el.releasePointerCapture(pid); } catch (_) {}
      clearHover();
      if (!wasDrag) { if (!cancelled && opts.onTap) opts.onTap(e); return; }
      const g = ghost; ghost = null;
      const target = cancelled ? null : dropTargetAt(e.clientX, e.clientY);
      const accepted = target && opts.onDrop ? opts.onDrop(target, e) : false;
      el.classList.remove("drag-source");
      if (accepted) { g.remove(); return; }
      // fly back home
      const r = el.getBoundingClientRect();
      g.style.transition = "transform .28s cubic-bezier(.3,1.4,.6,1)";
      g.style.transform = `translate(${r.left}px, ${r.top}px)`;
      setTimeout(() => g.remove(), 300);
      if (opts.onCancel) opts.onCancel(target);
    }
    el.addEventListener("pointerup", (e) => finish(e, false));
    el.addEventListener("pointercancel", (e) => finish(e, true));
  }

  /* ---------------- SVG dragging (user-unit coordinates) ---------------- */
  function svgPoint(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  /* opts: getPos() -> {x,y}; onMove(x,y,dx,dy); onEnd(x,y,moved); enabled() */
  function svg(el, svgEl, opts) {
    let start = null, startPos = null, pid = null, moved = false;
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== undefined && e.button > 0) return;
      if (opts.enabled && !opts.enabled()) return;
      e.preventDefault();
      if (opts.stopPropagation) e.stopPropagation(); // nested draggables (e.g. a grip inside a filament)
      pid = e.pointerId;
      start = svgPoint(svgEl, e.clientX, e.clientY);
      startPos = opts.getPos ? opts.getPos() : { x: 0, y: 0 };
      moved = false;
      // onStart may re-order the DOM (bring to front), which would drop pointer capture — so run it first
      if (opts.onStart) opts.onStart();
      try { el.setPointerCapture(pid); } catch (_) {}
      el.classList.add("dragging");
    });
    el.addEventListener("pointermove", (e) => {
      if (!start || e.pointerId !== pid) return;
      const p = svgPoint(svgEl, e.clientX, e.clientY);
      const dx = p.x - start.x, dy = p.y - start.y;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      if (opts.onMove) opts.onMove(startPos.x + dx, startPos.y + dy, dx, dy, p);
      e.preventDefault();
    });
    function end(e) {
      if (!start || e.pointerId !== pid) return;
      const p = svgPoint(svgEl, e.clientX, e.clientY);
      const dx = p.x - start.x, dy = p.y - start.y;
      start = null;
      el.classList.remove("dragging");
      try { el.releasePointerCapture(pid); } catch (_) {}
      if (opts.onEnd) opts.onEnd(startPos.x + dx, startPos.y + dy, moved, e);
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }

  window.Drag = { html, svg, svgPoint };
})();
