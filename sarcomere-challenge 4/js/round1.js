/* ROUND 1 — Sequence Sort */
(function () {
  "use strict";
  const C = window.SARC_CONTENT, G = window.Game, P = G.POINTS;
  let placed, selected, mistakes, hints, cards;

  function shuffle(arr) {
    const a = arr.slice();
    do {
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    } while (a.length > 2 && a.every((x, i) => x.order === i)); // never hand out an already-solved deck
    return a;
  }

  function $(id) { return document.getElementById(id); }

  function start() {
    const N = C.sequence.length;
    placed = new Array(N).fill(false);
    selected = null; mistakes = 0; hints = 0; cards = [];
    G.setRound("r1", 0);
    const slots = $("r1-slots"), tray = $("r1-tray");
    slots.innerHTML = ""; tray.innerHTML = "";
    $("r1-done").hidden = true;
    $("r1-hint").disabled = false;

    for (let i = 0; i < N; i++) {
      const li = document.createElement("li");
      li.className = "r1-slot";
      li.dataset.drop = "slot";
      li.dataset.slot = i;
      li.tabIndex = 0;
      li.setAttribute("role", "button");
      li.setAttribute("aria-label", "Step " + (i + 1) + " (empty)");
      li.innerHTML = `<span class="slot-n">${i + 1}</span><span class="slot-empty">Drop step ${i + 1} here</span>`;
      li.addEventListener("click", () => { if (selected) tryPlace(selected, i); });
      li.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && selected) { e.preventDefault(); tryPlace(selected, i); } });
      slots.appendChild(li);
    }

    const items = C.sequence.map((s, i) => ({ order: i, text: s.short }));
    shuffle(items).forEach((it) => {
      const b = document.createElement("button");
      b.className = "seq-card";
      b.type = "button";
      b.dataset.order = it.order;
      b.innerHTML = `<span class="grip" aria-hidden="true">⠿</span><span class="card-text">${it.text}</span>`;
      tray.appendChild(b);
      cards.push(b);
      Drag.html(b, {
        enabled: () => !b.classList.contains("locked"),
        onStart: () => select(null),
        onDrop: (target) => target.dataset.slot !== undefined ? tryPlace(b, +target.dataset.slot) : false,
        onTap: () => { if (!b.classList.contains("locked")) select(selected === b ? null : b); }
      });
      // keyboard: Enter/Space on a focused card selects it (click fires from keyboard)
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(selected === b ? null : b); } });
    });
    updateLeft();
  }

  function select(card) {
    if (selected) selected.classList.remove("selected");
    selected = card;
    document.getElementById("r1-slots").classList.toggle("awaiting", !!card);
    if (card) card.classList.add("selected");
  }

  function tryPlace(card, idx) {
    const slot = document.querySelector(`.r1-slot[data-slot="${idx}"]`);
    if (placed[idx]) { flash(slot, "nudge"); App.toast("That step is already filled.", "info"); return false; }
    const order = +card.dataset.order;
    if (order === idx) {
      placed[idx] = true;
      select(null);
      card.classList.add("locked");
      card.disabled = true;
      slot.classList.add("filled");
      slot.setAttribute("aria-label", "Step " + (idx + 1) + ": " + card.textContent.replace("⠿", "").trim());
      slot.querySelector(".slot-empty").replaceWith(card);
      flash(slot, "glow");
      G.correct("r1", P.r1Correct, slot);
      updateLeft();
      if (placed.every(Boolean)) finish();
      return true;
    }
    mistakes++;
    flash(card, "shake");
    flash(slot, "bad");
    G.wrong("r1", P.r1Wrong, slot);
    const diff = order - idx;
    App.toast(diff > 0 ? "Not yet! That happens later in the sequence." : "Too late! That step happens earlier.", "bad");
    select(null);
    return false;
  }

  function flash(el, cls) {
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 900);
  }

  function updateLeft() {
    const n = placed.filter(Boolean).length;
    document.getElementById("r1-left").textContent = `(${placed.length - n} left)`;
    G.setProgress(n / placed.length);
  }

  function hint() {
    const idx = placed.indexOf(false);
    if (idx < 0) return;
    const card = cards.find((c) => +c.dataset.order === idx);
    const slot = document.querySelector(`.r1-slot[data-slot="${idx}"]`);
    hints++; G.s.hints++;
    G.add("r1", P.r1Hint, slot, "hint");
    card.scrollIntoView({ block: "nearest", behavior: "smooth" });
    flash(card, "hinted"); flash(slot, "hinted");
    card.classList.add("hint-mark"); setTimeout(() => card.classList.remove("hint-mark"), 2500);
  }

  function finish() {
    $("r1-hint").disabled = true;
    let msg = "🎉 Sequence complete!";
    if (mistakes === 0 && hints === 0) {
      G.add("r1", P.r1Perfect, $("r1-done"));
      msg += ` Perfect run — +${P.r1Perfect} bonus!`;
    } else {
      msg += ` ${mistakes} mistake${mistakes === 1 ? "" : "s"}, ${hints} hint${hints === 1 ? "" : "s"}.`;
    }
    $("r1-done-msg").textContent = msg;
    $("r1-done").hidden = false;
    setTimeout(() => $("r1-done").scrollIntoView({ behavior: "smooth", block: "center" }), 200);
    App.confettiBurst();
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("r1-hint").addEventListener("click", hint);
    $("r1-next").addEventListener("click", () => App.go("r2"));
    $("r1-skip").addEventListener("click", () => { if (confirm("Skip Round 1? You'll score no further points for it.")) App.go("r2"); });
  });

  window.Rounds = window.Rounds || {};
  window.Rounds.r1 = { start, _debug: () => ({ placed, mistakes, hints }) };
})();
