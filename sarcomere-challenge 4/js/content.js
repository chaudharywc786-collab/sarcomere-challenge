/* =====================================================================
   SARCOMERE STOP-MOTION CHALLENGE — EDITABLE CONTENT
   ---------------------------------------------------------------------
   Everything a teacher/student might want to change lives in this file.
   Edit the text between the quotes. Keep commas between items.
   (This is a .js file rather than .json so the game still works when
   index.html is opened straight from a folder — browsers block loading
   .json files from file:// pages.)
   ===================================================================== */

window.SARC_CONTENT = {

  /* ---------------- General settings ---------------- */
  settings: {
    title: "Sarcomere Stop-Motion Challenge",
    quickfireCount: 10,          // how many MCQs per play-through (max = number in the bank below)
    quickfireSeconds: 20,        // time per question when the timer is switched on
    leaderboardSize: 10
  },

  /* ---------------- Sarcomere dimensions (micrometres) ----------------
     Textbook values vary a little (thick ~1.6 µm, thin ~1.0 µm).
     Change them here and every round + the examiner view updates.     */
  dimensions: {
    thick: 1.6,          // thick (myosin) filament length = A band width
    thin: 1.0,           // thin (actin) filament length, measured from the Z disc
    relaxedSL: 2.5,      // relaxed sarcomere length (Z disc to Z disc)
    contractedSL: 2.0,   // fully contracted length shown in the examiner view and title animation (thin filaments meet: H zone = 0)
    bareZone: 0.15       // half-width of the region in the middle of the thick filament without myosin heads (drawing only)
  },

  /* ---------------- ROUND 1: contraction sequence ----------------
     These MUST stay in the correct order here — the game shuffles them.
     "short" is the main card text; "detail" is shown in the examiner view. */
  sequence: [
    { short: "Action potential reaches the motor neuron axon terminal",
      detail: "The nerve impulse travels down the motor neuron to the axon terminal at the neuromuscular junction." },
    { short: "Voltage-gated Ca²⁺ channels open; Ca²⁺ enters the terminal",
      detail: "Depolarisation of the terminal opens voltage-gated calcium channels." },
    { short: "ACh is released into the synaptic cleft",
      detail: "Ca²⁺ entry triggers exocytosis of acetylcholine-containing synaptic vesicles." },
    { short: "ACh binds nicotinic receptors on the motor end plate; Na⁺ enters, producing an end plate potential",
      detail: "Nicotinic ACh receptors are ligand-gated cation channels; the net Na⁺ influx depolarises the end plate." },
    { short: "Action potential spreads along the sarcolemma and down T-tubules",
      detail: "The end plate potential triggers a muscle action potential that is carried deep into the fibre by T-tubules." },
    { short: "Ca²⁺ is released from the sarcoplasmic reticulum",
      detail: "The T-tubule voltage sensors (DHP receptors) are linked to ryanodine receptors on the SR, which release Ca²⁺." },
    { short: "Ca²⁺ binds troponin; tropomyosin shifts, exposing myosin-binding sites on actin",
      detail: "Ca²⁺ binds troponin C, causing a conformational change that moves tropomyosin off the binding sites." },
    { short: "Myosin heads bind actin (cross-bridge formation)",
      detail: "Energised (cocked) myosin heads attach to exposed binding sites on actin." },
    { short: "Power stroke: thin filaments slide toward the M line",
      detail: "Release of Pi (then ADP) is linked to the head pivoting, pulling the thin filament toward the centre of the sarcomere." },
    { short: "ATP binds myosin, causing detachment; ATP hydrolysis re-cocks the head",
      detail: "A new ATP binding breaks the cross-bridge; hydrolysis of ATP to ADP + Pi returns the head to the high-energy position." },
    { short: "Cycle repeats while Ca²⁺ and ATP are available; sarcomere shortens",
      detail: "Repeated cycles pull Z discs closer together; filaments themselves do not change length." },
    { short: "Acetylcholinesterase breaks down ACh; Ca²⁺ is pumped back into the SR; muscle relaxes",
      detail: "AChE ends the signal; SERCA pumps return Ca²⁺ to the SR, tropomyosin re-covers the binding sites and the muscle relaxes." }
  ],

  /* ---------------- ROUND 2: decoy pieces ----------------
     Extra pieces that look tempting but are wrong for a RELAXED sarcomere. */
  decoys: [
    { id: "longThin", kind: "thin", length: 1.25, name: "Thin filament set",
      feedback: "That thin filament set is too long. In a RELAXED sarcomere the thin filaments do NOT reach the M line — the gap between their ends is the H zone." },
    { id: "shortThick", kind: "thick", length: 1.0, name: "Thick filament",
      feedback: "That thick filament is too short. The thick (myosin) filament is ~1.6 µm and its length defines the A band." }
  ],

  /* ---------------- ROUND 2: label explanations (shown after a correct drop) ---------------- */
  labels: {
    A: { name: "A band", info: "A band = the full length of the thick filament (dark/anisotropic band). It never changes length." },
    I: { name: "I band", info: "I band = thin filaments only, either side of the Z disc (light/isotropic band). It shortens in contraction." },
    H: { name: "H zone", info: "H zone = thick filament only, in the centre of the A band (no thin-filament overlap). It shrinks and can disappear." },
    M: { name: "M line", info: "M line = the centre of the sarcomere where thick filaments are anchored together." }
  },

  /* ---------------- Partner Mode prompts (examiner ticks these) ---------------- */
  partnerPrompts: {
    r1: [
      "Did they explain why Ca²⁺ entry into the axon terminal is needed for ACh release?",
      "Did they name the receptor type on the motor end plate (nicotinic)?",
      "Did they explain the role of T-tubules?",
      "Did they say what troponin and tropomyosin do when Ca²⁺ binds?",
      "Did they explain why ATP is needed for myosin to DETACH from actin?",
      "Did they describe how relaxation happens (AChE + Ca²⁺ pumped back into the SR)?"
    ],
    r2: [
      "Did they say which filament is attached to the Z disc?",
      "Did they explain what defines the A band (length of the thick filament)?",
      "Did they explain what the I band contains (thin filaments only)?",
      "Did they explain why there is an H zone in a relaxed sarcomere?",
      "Did they say what the M line does?"
    ],
    r3: [
      "Did they explain why ATP is needed for detachment as well as for the power stroke?",
      "Did they explain why no Ca²⁺ means no contraction, even though the muscle fibre is excited?",
      "Did they describe how the ACh signal is normally switched off at the neuromuscular junction?",
      "Did they say where Ca²⁺ goes during relaxation, and what pumps it there?",
      "Did they explain how troponin and tropomyosin together expose the myosin-binding sites?",
      "Did they tell apart 'can't relax' (the signal or Ca²⁺ stays on) and 'stays contracted' (heads locked on actin)?",
      "Did they link each scenario back to the right step of the contraction sequence?"
    ],
    qf: [
      "Did they explain their reasoning out loud before answering?",
      "Did they correctly use the terms 'thick filament' and 'thin filament'?"
    ]
  },

  /* ---------------- ROUND 3: What's Missing? ----------------
     Tap-only. Each scenario removes one ingredient of contraction. Two questions per scenario:
       (a) stepQuestion: which step of the Round 1 sequence fails?
           options = step numbers from the "sequence" list above (1-12); answer = the correct step number
           nudges  = a short concept nudge for each WRONG option (never names the right answer)
       (b) effectQuestion: what does the muscle do? answer must match one of "effects" exactly
     highlight = the step number(s) highlighted on the sequence list once part (a) is answered.
     Options are shuffled every time a scenario is shown. */
  whatsMissing: {
    hintAfter: 2,     // wrong tries (in one question) before the hint button unlocks
    revealAfter: 3,   // wrong tries before the answer is explained and the game moves on (no points for that scenario)
    effects: ["Can't contract", "Can't relax", "Stays contracted", "Contracts weakly"],
    effectGuide: "Can't relax = the 'on' signal or Ca²⁺ never switches off, so cycling continues. Stays contracted = myosin heads are locked onto actin and can't let go.",
    scenarios: [
      { missing: "No ATP available", icon: "🔋",
        stepQuestion: { answer: 10, options: [10, 9, 8, 6],
          nudges: {
            9: "The energy for a power stroke is already stored in the cocked head. Think about what a head needs AFTER its stroke.",
            8: "Attaching to actin doesn't need a new ATP. The cocked head already holds ADP + Pi. What can't happen next?",
            6: "Ca²⁺ release isn't the step that needs ATP directly here. Think about a myosin head sitting on actin."
          },
          hint: "Ask yourself: what does a new ATP do to a myosin head that is stuck on actin?",
          explain: "Without ATP, myosin heads can't detach from actin after the power stroke, so cross-bridge cycling stops at that step." },
        effectQuestion: { answer: "Stays contracted",
          nudges: {
            "Can't contract": "Think about the heads already attached to actin when ATP runs out. Can they let go?",
            "Can't relax": "Close, but is the problem a signal that won't switch off, or heads that physically can't let go?",
            "Contracts weakly": "Are the attached heads still cycling slowly, or are they stuck in place?"
          },
          hint: "Picture the cross-bridges after the last power stroke, with no ATP to break them.",
          explain: "The heads stay locked onto actin (the rigor state), so the muscle stays contracted and stiff. ATP is needed to relax, not just to contract." },
        highlight: [10] },

      { missing: "No Ca²⁺ released from the sarcoplasmic reticulum", icon: "🧂",
        stepQuestion: { answer: 6, options: [6, 5, 7, 3],
          nudges: {
            5: "The action potential still travels along the sarcolemma and down the T-tubules. What should it trigger next?",
            7: "Troponin works normally here. Think about what it needs to bind.",
            3: "The nerve signal and ACh release are fine in this scenario. Look further along, inside the muscle fibre."
          },
          hint: "Follow the signal: it reaches the T-tubules normally. Which store should respond?",
          explain: "The action potential reaches the T-tubules, but no Ca²⁺ comes out of the SR, so troponin never gets Ca²⁺ to bind." },
        effectQuestion: { answer: "Can't contract",
          nudges: {
            "Can't relax": "Relaxing means removing Ca²⁺. Was any Ca²⁺ released in the first place?",
            "Stays contracted": "To stay contracted, cross-bridges must form first. Could they form here?",
            "Contracts weakly": "With NO Ca²⁺ at all, would any myosin-binding sites be exposed?"
          },
          hint: "Without Ca²⁺, what keeps covering the myosin-binding sites on actin?",
          explain: "Tropomyosin keeps covering the binding sites, so no cross-bridges form. The muscle can't contract even though the fibre was excited." },
        highlight: [6] },

      { missing: "No ACh released at the neuromuscular junction", icon: "📭",
        stepQuestion: { answer: 3, options: [3, 2, 4, 5],
          nudges: {
            2: "The Ca²⁺ channels in the axon terminal work here. Think about what Ca²⁺ entry normally triggers.",
            4: "The receptors on the motor end plate are fine. Think about what they are waiting for.",
            5: "The sarcolemma could carry an action potential, but something earlier has to start one."
          },
          hint: "Which chemical carries the signal across the synaptic cleft?",
          explain: "The signal reaches the axon terminal, but no ACh crosses the synaptic cleft, so nothing binds the receptors on the motor end plate." },
        effectQuestion: { answer: "Can't contract",
          nudges: {
            "Can't relax": "For a muscle to fail to relax it first has to be stimulated. Is it stimulated here?",
            "Stays contracted": "Did the muscle fibre ever get the message to contract?",
            "Contracts weakly": "Does ANY signal reach the muscle fibre here?"
          },
          hint: "No end plate potential means no muscle action potential. What follows from that?",
          explain: "No end plate potential means no muscle action potential and no Ca²⁺ release, so the muscle can't contract." },
        highlight: [3] },

      { missing: "Troponin can't bind Ca²⁺", icon: "🔒",
        stepQuestion: { answer: 7, options: [7, 6, 8, 11],
          nudges: {
            6: "Ca²⁺ is released from the SR normally here. Where does it need to go next?",
            8: "Myosin heads are ready to bind. What has to happen to actin first?",
            11: "The cycle never gets started in this scenario. Look at an earlier step."
          },
          hint: "Ca²⁺ is present in the sarcoplasm. Which protein normally grabs it?",
          explain: "Ca²⁺ is released, but troponin can't bind it, so tropomyosin is never pulled off the binding sites." },
        effectQuestion: { answer: "Can't contract",
          nudges: {
            "Can't relax": "Relaxation problems come from things that won't switch off. Did anything switch on here?",
            "Stays contracted": "Could any cross-bridges form in the first place?",
            "Contracts weakly": "Even with lots of Ca²⁺, are any binding sites exposed?"
          },
          hint: "If tropomyosin never moves, what can myosin bind to?",
          explain: "The myosin-binding sites on actin stay covered, so no cross-bridges form and the muscle can't contract, despite plenty of Ca²⁺." },
        highlight: [7] },

      { missing: "No acetylcholinesterase", icon: "🧽",
        stepQuestion: { answer: 12, options: [12, 4, 3, 10],
          nudges: {
            4: "ACh binds the receptors normally. The problem is what happens afterwards.",
            3: "ACh is released normally. Think about how its signal is switched off.",
            10: "ATP is fine in this scenario. Think about the neuromuscular junction."
          },
          hint: "Which enzyme normally clears ACh from the synaptic cleft?",
          explain: "Acetylcholinesterase normally breaks down ACh. Without it, ACh stays in the cleft and keeps stimulating the motor end plate." },
        effectQuestion: { answer: "Can't relax",
          nudges: {
            "Can't contract": "The signal still gets through, and for longer than usual. Would contraction start?",
            "Stays contracted": "Close. Are the myosin heads physically locked here, or still cycling because the signal never switches off?",
            "Contracts weakly": "Is the stimulation weak here, or does it keep going?"
          },
          hint: "What happens to stimulation of the end plate if ACh is never cleared away?",
          explain: "The end plate keeps being stimulated, so Ca²⁺ keeps being released and cross-bridges keep cycling. The muscle can't relax." },
        highlight: [12] },

      { missing: "No calcium pump (SERCA) returning Ca²⁺ to the SR", icon: "🚰",
        stepQuestion: { answer: 12, options: [12, 6, 7, 10],
          nudges: {
            6: "Ca²⁺ release works normally. The problem is what happens to the Ca²⁺ afterwards.",
            7: "Troponin binds Ca²⁺ normally. Think about how Ca²⁺ is removed afterwards.",
            10: "ATP binding and detachment work here. Think about the Ca²⁺ concentration after stimulation ends."
          },
          hint: "When stimulation stops, where does Ca²⁺ normally go?",
          explain: "Ca²⁺ is normally pumped back into the SR at the end of a contraction. Without the pump, Ca²⁺ stays high in the sarcoplasm." },
        effectQuestion: { answer: "Can't relax",
          nudges: {
            "Can't contract": "Ca²⁺ is released normally, so would contraction start?",
            "Stays contracted": "Close. Are the heads locked on, or still cycling because Ca²⁺ is still bound to troponin?",
            "Contracts weakly": "There's plenty of Ca²⁺ here, not too little."
          },
          hint: "If Ca²⁺ stays bound to troponin, what stays exposed on actin?",
          explain: "Ca²⁺ stays bound to troponin, so the binding sites stay exposed and the heads keep cycling while ATP lasts. The muscle can't relax." },
        highlight: [12] },

      { missing: "Tropomyosin can't shift off the myosin-binding sites", icon: "🧱",
        stepQuestion: { answer: 7, options: [7, 8, 6, 9],
          nudges: {
            8: "Myosin heads are ready. What has to happen to the binding sites first?",
            6: "Ca²⁺ is released normally here. Follow it a little further.",
            9: "A power stroke needs a cross-bridge first. Look earlier in the sequence."
          },
          hint: "Ca²⁺ binds troponin normally. Which protein then has to move out of the way?",
          explain: "Ca²⁺ binds troponin, but tropomyosin can't roll off the binding sites, so actin stays blocked." },
        effectQuestion: { answer: "Can't contract",
          nudges: {
            "Can't relax": "Did contraction ever start in this scenario?",
            "Stays contracted": "Could any cross-bridges form while the binding sites are covered?",
            "Contracts weakly": "Are ANY binding sites uncovered here?"
          },
          hint: "With the binding sites covered, what can't myosin do?",
          explain: "The myosin-binding sites stay covered, so no cross-bridges form and the muscle can't contract." },
        highlight: [7] },

      { missing: "Myosin heads can't re-cock after the power stroke", icon: "🔧",
        stepQuestion: { answer: 10, options: [10, 9, 8, 11],
          nudges: {
            9: "The first power stroke still happens. What prepares the head for the next one?",
            8: "Cross-bridges can form once. Think about what happens after the stroke.",
            11: "Repeating the cycle depends on an earlier step working. Which step resets the head?"
          },
          hint: "After a head detaches, what normally puts it back into its high-energy position?",
          explain: "ATP binds and the head detaches, but ATP hydrolysis can't re-cock it, so the head can't make another power stroke." },
        effectQuestion: { answer: "Contracts weakly",
          nudges: {
            "Can't contract": "Each head can still make ONE power stroke. Would that shorten the sarcomere at all?",
            "Can't relax": "Ca²⁺ handling is normal here. Is the problem switching off, or keeping going?",
            "Stays contracted": "The heads can still detach here, because ATP binds. Are they locked on?"
          },
          hint: "How many power strokes can each head make in this scenario?",
          explain: "Each head makes only its first power stroke and can't keep cycling, so there is only a small, weak shortening instead of a sustained contraction." },
        highlight: [10] }
    ]
  },

  /* ---------------- Quick-fire MCQ bank ----------------
     answer = index of the correct option (0 = first option).
     Options are shuffled in the game, so you can always put the right one first. */
  questions: [
    { topic: "Sarcomere structure",
      q: "A sarcomere is defined as the region between…",
      options: ["Two adjacent Z discs", "Two adjacent M lines", "The two ends of the A band", "Two adjacent H zones"],
      answer: 0,
      explain: "The sarcomere is the functional unit of contraction and runs from one Z disc to the next." },
    { topic: "Sarcomere structure",
      q: "Which band corresponds exactly to the length of the thick filaments?",
      options: ["A band", "I band", "H zone", "Z disc"],
      answer: 0,
      explain: "The A band spans the entire thick (myosin) filament, including where it overlaps thin filaments." },
    { topic: "Sarcomere structure",
      q: "The I band contains…",
      options: ["Thin filaments only", "Thick filaments only", "Overlapping thick and thin filaments", "Only the M line"],
      answer: 0,
      explain: "The I band is the light band containing only thin (actin) filaments, bisected by the Z disc." },
    { topic: "Sarcomere structure",
      q: "Thin filaments are anchored at the…",
      options: ["Z disc", "M line", "H zone", "Sarcoplasmic reticulum"],
      answer: 0,
      explain: "Actin filaments are anchored to the Z disc (via α-actinin); thick filaments are held at the M line." },
    { topic: "Sarcomere structure",
      q: "The H zone is the region where there are…",
      options: ["Thick filaments but no thin filaments", "Thin filaments but no thick filaments", "Only Z disc proteins", "Overlapping thick and thin filaments"],
      answer: 0,
      explain: "The H zone is the central part of the A band where thin filaments do not overlap the thick filaments." },
    { topic: "Sliding filament theory",
      q: "During contraction, which of these stays the SAME length?",
      options: ["A band", "I band", "H zone", "Sarcomere"],
      answer: 0,
      explain: "The A band is the thick filament length, which does not change. The I band, H zone and sarcomere all shorten." },
    { topic: "Sliding filament theory",
      q: "What happens to the H zone during a strong contraction?",
      options: ["It narrows and may disappear", "It widens", "It stays the same", "It becomes part of the I band"],
      answer: 0,
      explain: "Thin filaments slide toward the M line, so the gap between them (H zone) narrows and can vanish." },
    { topic: "Sliding filament theory",
      q: "According to the sliding filament theory, the sarcomere shortens because…",
      options: ["Thin filaments slide past thick filaments toward the M line", "Thick filaments shorten by coiling", "Thin filaments shorten by depolymerising", "Z discs contract"],
      answer: 0,
      explain: "Neither filament changes length; they slide past each other, increasing overlap and pulling Z discs together." },
    { topic: "Sliding filament theory",
      q: "What causes a myosin head to DETACH from actin?",
      options: ["Binding of a new ATP molecule", "Release of ADP", "Binding of Ca²⁺ to troponin", "Hydrolysis of ACh"],
      answer: 0,
      explain: "ATP binding to myosin lowers its affinity for actin, releasing the cross-bridge. Without ATP, heads stay attached (rigor mortis)." },
    { topic: "Sliding filament theory",
      q: "Hydrolysis of ATP by the myosin head…",
      options: ["Re-cocks the head into its high-energy position", "Directly causes the power stroke", "Releases Ca²⁺ from the SR", "Breaks down acetylcholine"],
      answer: 0,
      explain: "ATP → ADP + Pi re-cocks (energises) the myosin head, ready to bind actin again." },
    { topic: "Neuromuscular junction",
      q: "Which ion's entry into the axon terminal triggers ACh release?",
      options: ["Ca²⁺", "Na⁺", "K⁺", "Cl⁻"],
      answer: 0,
      explain: "Voltage-gated Ca²⁺ channels open when the action potential arrives; Ca²⁺ influx triggers vesicle exocytosis." },
    { topic: "Neuromuscular junction",
      q: "Acetylcholine receptors on the motor end plate are…",
      options: ["Nicotinic (ligand-gated ion channels)", "Muscarinic (G-protein coupled)", "Adrenergic receptors", "Voltage-gated Ca²⁺ channels"],
      answer: 0,
      explain: "Skeletal muscle end plates have nicotinic ACh receptors, which open to let cations (mainly Na⁺) in." },
    { topic: "Neuromuscular junction",
      q: "What is the job of acetylcholinesterase?",
      options: ["Breaks down ACh in the synaptic cleft", "Pumps Ca²⁺ into the SR", "Synthesises ACh", "Opens nicotinic receptors"],
      answer: 0,
      explain: "AChE rapidly hydrolyses ACh, ending stimulation of the end plate so the muscle can relax." },
    { topic: "Neuromuscular junction",
      q: "The end plate potential is mainly caused by…",
      options: ["Na⁺ entering through nicotinic receptors", "Ca²⁺ leaving the SR", "K⁺ entering the muscle fibre", "ACh entering the muscle fibre"],
      answer: 0,
      explain: "Opening nicotinic channels produces a net influx of Na⁺, depolarising the motor end plate." },
    { topic: "Excitation–contraction coupling",
      q: "What is the role of T-tubules?",
      options: ["Carry the action potential deep into the muscle fibre", "Store Ca²⁺", "Anchor the thin filaments", "Produce ATP"],
      answer: 0,
      explain: "T-tubules are invaginations of the sarcolemma that carry the action potential close to the SR throughout the fibre." },
    { topic: "Excitation–contraction coupling",
      q: "Ca²⁺ for skeletal muscle contraction is mainly released from the…",
      options: ["Sarcoplasmic reticulum", "Extracellular fluid via T-tubules", "Mitochondria", "Nucleus"],
      answer: 0,
      explain: "In skeletal muscle, Ca²⁺ comes from the SR (terminal cisternae), triggered by the action potential in the T-tubules." },
    { topic: "Excitation–contraction coupling",
      q: "Ca²⁺ starts contraction by binding to…",
      options: ["Troponin", "Tropomyosin", "Myosin", "Actin"],
      answer: 0,
      explain: "Ca²⁺ binds troponin, which shifts tropomyosin away from the myosin-binding sites on actin." },
    { topic: "Excitation–contraction coupling",
      q: "In a resting muscle fibre, what blocks the myosin-binding sites on actin?",
      options: ["Tropomyosin", "Troponin C", "Titin", "ATP"],
      answer: 0,
      explain: "Tropomyosin lies along the actin filament covering the binding sites until Ca²⁺–troponin moves it." },
    { topic: "Excitation–contraction coupling",
      q: "How does a skeletal muscle fibre relax after stimulation stops?",
      options: ["Ca²⁺ is actively pumped back into the SR", "Ca²⁺ diffuses into T-tubules", "Myosin heads run out of actin", "Thin filaments get shorter"],
      answer: 0,
      explain: "SR Ca²⁺-ATPase (SERCA) pumps Ca²⁺ back in; troponin–tropomyosin re-cover the binding sites." }
  ],

  /* ---------------- Final rating tiers (by % of maximum points) ---------------- */
  ratings: [
    { min: 85, title: "Sarcomere Master",       emoji: "🏆", blurb: "Z discs bow before you. Textbook-level understanding!" },
    { min: 65, title: "Cross-Bridge Champion",  emoji: "💪", blurb: "Strong power strokes — just a few loose filaments to tighten." },
    { min: 45, title: "Filament Apprentice",    emoji: "🧪", blurb: "You've got the sliding started. Review the bands and the NMJ steps." },
    { min: 0,  title: "Resting Fibre",          emoji: "😴", blurb: "Plenty of ATP left in the tank — have another go!" }
  ]
};
