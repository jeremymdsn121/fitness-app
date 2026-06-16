/* ============================================================
   Camp — local-first training & nutrition companion (PWA)
   No backend, no accounts. All state in localStorage.
   ============================================================ */

"use strict";

/* ---------------------------------------------------------------
   DATA — hard-coded program content (from the build spec)
   --------------------------------------------------------------- */

// The weekly rotation of session *types*. The cursor walks this.
const ROTATION = [
  "Lower-Heavy", "Volleyball", "Upper", "Lower-Power", "Volleyball", "Volleyball", "Rest",
];

// Short labels for the "this week" strip.
const SLOT_SHORT = {
  "Lower-Heavy": "Lower\nHeavy",
  "Upper": "Upper",
  "Lower-Power": "Lower\nPower",
  "Volleyball": "VB",
  "Rest": "Rest",
};

// Exercise rows: { name, rx, note?, left? }  (left=true highlights the CP left-first cue)
const EX = (name, rx, opts = {}) => ({ name, rx, note: opts.note || "", left: !!opts.left });

// Sessions keyed by phase then slot type.
const SESSIONS = {
  1: {
    "Lower-Heavy": {
      name: "Lower — Heavy Slow Resistance",
      sub: "3s down / 3s up. No gym jumping this phase.",
      ex: [
        EX("Leg press (both legs)", "4×8", { note: "HSR tempo" }),
        EX("Bulgarian split squat — LEFT first", "3×10", { left: true, note: "count honest reps" }),
        EX("Bulgarian split squat — right", "3×10", { note: "match the left's reps" }),
        EX("Single-leg RDL (DB)", "3×10 / side"),
        EX("Spanish squat isometric", "5×45s"),
        EX("Standing calf raise", "3×15"),
      ],
    },
    "Upper": {
      name: "Upper",
      sub: "",
      ex: [
        EX("Bench press (BB or DB)", "4×8"),
        EX("One-arm DB row", "3×10 / side", { note: "match left to right" }),
        EX("Overhead press", "3×8"),
        EX("Lat pulldown or pull-ups", "3×10"),
        EX("Face pulls + curls + triceps", "3×12"),
      ],
    },
    "Lower-Power": {
      name: "Mobility + tendon work",
      sub: "Phase 1 has no power day — keep this slot easy.",
      ex: [
        EX("Spanish squat isometric", "5×45s", { note: "the priority" }),
        EX("Hip / ankle mobility", "10 min"),
        EX("Optional easy walk", "20–30 min"),
      ],
    },
    "Volleyball": {
      name: "Volleyball",
      sub: "Knee isometrics as warm-up.",
      ex: [
        EX("Spanish squat isometric (warm-up)", "3×45s"),
        EX("Play", "—", { note: "keep pain ≤3/10 during" }),
      ],
    },
    "Rest": {
      name: "Rest / walk",
      sub: "Recovery. Extra Spanish squat isometrics optional.",
      ex: [
        EX("Walk", "20–30 min", { note: "optional" }),
        EX("Spanish squat isometric", "5×45s", { note: "optional, anywhere" }),
      ],
    },
  },

  2: {
    "Lower-Heavy": {
      name: "Lower — Heavy Strength",
      sub: "Load to what the LEFT handles cleanly.",
      ex: [
        EX("Back squat OR trap-bar deadlift", "4×5"),
        EX("Bulgarian split squat (loaded) — LEFT first", "3×8 / side", { left: true }),
        EX("Leg press (HSR tempo)", "3×10"),
        EX("Single-leg RDL", "3×8 / side"),
        EX("Spanish squat isometric", "4×45s"),
      ],
    },
    "Upper": {
      name: "Upper",
      sub: "Same as Phase 1 — heavier.",
      ex: [
        EX("Bench press (BB or DB)", "4×8", { note: "heavier" }),
        EX("One-arm DB row", "3×10 / side", { note: "match left to right" }),
        EX("Overhead press", "3×8"),
        EX("Lat pulldown or pull-ups", "3×10"),
        EX("Face pulls + curls + triceps", "3×12"),
      ],
    },
    "Lower-Power": {
      name: "Lower — Power / Jump Intro",
      sub: "Land soft & quiet. Stop if form degrades.",
      ex: [
        EX("Box jumps", "5×3", { note: "step DOWN, don't jump down" }),
        EX("Trap-bar jump or DB squat jump", "4×3"),
        EX("Broad jump → stick landing", "4×3"),
        EX("Pogo hops", "3×10", { note: "low, stiff ankle" }),
        EX("Split squat (moderate) — LEFT first", "3×8 / side", { left: true }),
      ],
    },
    "Volleyball": SESSIONS_VB(),
    "Rest": SESSIONS_REST(),
  },

  3: {
    "Lower-Heavy": {
      name: "Lower — Heavy Strength (maintain)",
      sub: "Keep the Monday heavy base.",
      ex: [
        EX("Back squat OR trap-bar deadlift", "4×5"),
        EX("Bulgarian split squat (loaded) — LEFT first", "3×8 / side", { left: true }),
        EX("Single-leg RDL", "3×8 / side"),
        EX("Spanish squat isometric", "4×45s"),
      ],
    },
    "Upper": {
      name: "Upper",
      sub: "Heavier.",
      ex: [
        EX("Bench press (BB or DB)", "4×8"),
        EX("One-arm DB row", "3×10 / side", { note: "match left to right" }),
        EX("Overhead press", "3×8"),
        EX("Lat pulldown or pull-ups", "3×10"),
        EX("Face pulls + curls + triceps", "3×12"),
      ],
    },
    "Lower-Power": {
      name: "Power — Contrast / Complex",
      sub: "Pair heavy + explosive back-to-back. Rest 2–3 min between rounds.",
      ex: [
        EX("Heavy squat ×3 → box jumps ×3", "4 rounds"),
        EX("Trap-bar DL ×3 → broad jump ×3", "4 rounds"),
        EX("Bulgarian split squat → split jump — LEFT first", "3 rounds", { left: true }),
        EX("Depth drops (low box) → land + hold", "4×4", { note: "only if knee 0/10" }),
        EX("Pogo + single-leg pogo", "3×10"),
      ],
    },
    "Volleyball": SESSIONS_VB("Volleyball expresses the new vertical."),
    "Rest": SESSIONS_REST(),
  },
};

function SESSIONS_VB(extra) {
  return {
    name: "Volleyball",
    sub: extra || "Knee isometrics as warm-up.",
    ex: [
      EX("Spanish squat isometric (warm-up)", "3×45s"),
      EX("Play", "—", { note: "keep pain ≤3/10 during" }),
    ],
  };
}
function SESSIONS_REST() {
  return {
    name: "Rest / walk",
    sub: "Recovery. Extra Spanish squat isometrics optional.",
    ex: [
      EX("Walk", "20–30 min", { note: "optional" }),
      EX("Spanish squat isometric", "5×45s", { note: "optional, anywhere" }),
    ],
  };
}

const TRAVEL_SESSION = {
  name: "Travel Mode — bodyweight + band",
  sub: "No gym, no volleyball. Keep the tendon progressing.",
  ex: [
    EX("Spanish squat / wall-sit isometric", "5×45s", { note: "NON-NEGOTIABLE" }),
    EX("Bulgarian split squat (BW) — LEFT first", "3×12 / side", { left: true }),
    EX("Single-leg RDL (BW or band)", "3×12 / side"),
    EX("Band row + band press", "3×15 each"),
    EX("Calf raises", "3×20"),
    EX("Optional: walk / incline treadmill", "20–30 min"),
  ],
};

const PHASE_INFO = {
  1: { title: "Phase 1 · Weeks 1–6", goal: "Settle tendon, rebuild left side. No gym jumping.", entry: "Start here." },
  2: { title: "Phase 2 · Weeks 7–16", goal: "Build strength, reintroduce power.", entry: "Enter when: morning knee ≤2/10 consistently · Spanish squats feel easy · volleyball not flaring the knee." },
  3: { title: "Phase 3 · Weeks 17–30", goal: "Convert strength to vertical (contrast / complex training).", entry: "Enter when: down 20+ lb · knee a non-issue · strong base." },
};

const RULES = {
  cp: {
    title: "The CP Left-Side Rule",
    body: "Left side is weaker (cerebral palsy). For every unilateral exercise, do the LEFT first, count its honest reps, and make the right side MATCH not exceed. This is the long-term fix for the left patellar tendon.",
  },
  tendon: {
    title: "The Tendon Protocol",
    body: "Spanish squat or wall-sit isometric — 5 sets × 45s holds, knee bent 70–90°, push hard. Pain should drop during/after. Do it 5–7×/week, anywhere including a hotel. This is the primary tendon-remodeling tool.",
  },
  hour24: {
    title: "The 24-Hour Rule",
    body: "Judge the knee by how it feels the next morning, not during. Pain ≤3/10 during loading is fine. If the morning after is worse and stays elevated past 24h, cut jump volume first — never the strength work.",
  },
};

const KNEE_RULE = "Judge the knee by tomorrow morning, not today. Keep pain ≤3/10.";

// ---- Meals ----
const MEALS = {
  breakfast: { title: "Breakfast", fixed: true, kcal: 820, p: 60, f: 26, c: 86,
    items: ["4 whole eggs", "80g dry oats cooked + 1 scoop whey stirred in", "1 banana"] },
  snack: { title: "Snack", fixed: true, kcal: 195, p: 23, f: 0, c: 26,
    items: ["250g 0% Greek yogurt + 140g berries"] },
  lunch: {
    A: { title: "Beef Burrito Bowl", kcal: 675, p: 55, f: 18, c: 73,
      items: ["170g 90/10 ground beef, taco-seasoned", "160g cooked rice + 120g black beans", "Salsa, peppers, onions"] },
    B: { title: "Chicken & Sweet Potato", kcal: 650, p: 58, f: 20, c: 60,
      items: ["225g chicken breast", "300g roasted sweet potato", "60g greens + 1 tbsp olive oil"] },
  },
  dinner: {
    A: { title: "White Fish & Potato Bowl", kcal: 640, p: 55, f: 18, c: 64,
      items: ["225g cod or tilapia (or canned tuna)", "300g roasted potato + 1 tbsp olive oil", "Roasted vegetables"] },
    B: { title: "Turkey Chili", kcal: 610, p: 60, f: 9, c: 72,
      items: ["200g 93/7 ground turkey", "180g beans + diced tomatoes + chili veg", "80g cooked rice"] },
  },
};

const TARGET = { kcal: 2300, p: 200, f: 60, c: 240 };

const TRAVEL_EAT_RULES = [
  "Anchor every meal to a palm-to-two-palms of protein.",
  "One fist of carbs per meal, not three. Skip the bread basket.",
  "Grilled not fried; sauces/dressing on the side; skip add-cheese/bacon.",
  "Hotel breakfast: eggs + oatmeal + fruit. Skip pastries/juice/waffles.",
  "Liquid calories = 0. Coffee black, water otherwise. Alcohol eats your weekly progress.",
  "Airport: grilled chicken, jerky, Greek yogurt, hard-boiled eggs, protein box.",
  "Missing target on 1–3 travel days/week will NOT break a 30-week plan. Consistency over perfection.",
];

const SHOPPING = {
  "Protein": [
    "Eggs (2 dozen)", "90/10 ground beef (1.5 lb)", "Chicken breast (2.5 lb)",
    "Cod / tilapia (1.5 lb)", "93/7 ground turkey (1.5 lb)", "Whey protein",
    "0% Greek yogurt (2× 32oz)", "Canned tuna (3–4)",
  ],
  "Carbs": [
    "Rolled oats", "White rice (2 lb)", "Sweet potatoes (4–5)", "Russet / yellow potatoes (5 lb)",
    "Black beans (3–4 cans)", "Bananas (7)", "Frozen berries (2–3 bags)",
  ],
  "Fats / Veg / Pantry": [
    "Olive oil", "Broccoli / green beans", "Salad greens (2 bags)",
    "Bell peppers + onions (4–5)", "Diced tomatoes (2–3 cans)", "Salsa", "Taco + chili seasoning",
  ],
};

const GOAL_WEIGHT = 175;
const START_WEIGHT = 210;

/* ---------------------------------------------------------------
   STATE — localStorage
   --------------------------------------------------------------- */
const LS_KEY = "camp.state.v1";

function defaultState() {
  return {
    currentPhase: 1,
    workoutCursor: 0,
    travelMode: false,
    mealRotation: { lunch: "A", dinner: "A" },
    shoppingList: {},          // itemId -> bool
    completedLog: [],          // {date, type, phase}
    startWeight: START_WEIGHT,
    weighIns: [],              // {date, weight}
    kneeScores: [],            // {date, score}
    seenOnboarding: false,
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) {
    return defaultState();
  }
}
function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
}

/* ---------------------------------------------------------------
   Helpers
   --------------------------------------------------------------- */
function todayISO() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function prettyDate() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
function shopId(section, i) { return section.replace(/[^a-z]/gi, "").toLowerCase() + "_" + i; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function sessionForSlot(phase, slot) {
  return SESSIONS[phase][slot];
}

/* ---------------------------------------------------------------
   Rendering
   --------------------------------------------------------------- */
const screenEl = document.getElementById("screen");
let activeTab = "today";

function exerciseListHTML(session, hero) {
  const rows = session.ex.map(e => `
    <li class="${e.left ? "is-left" : ""}">
      <span class="ex-name">${esc(e.name)}${e.note ? `<span class="ex-note">${esc(e.note)}</span>` : ""}</span>
      <span class="ex-rx">${esc(e.rx)}</span>
    </li>`).join("");
  return `<ul class="ex-list">${rows}</ul>`;
}

/* ----- TODAY ----- */
function renderToday() {
  const phase = state.currentPhase;
  const slot = ROTATION[state.workoutCursor];
  const session = state.travelMode ? TRAVEL_SESSION : sessionForSlot(phase, slot);
  const lastKnee = state.kneeScores.length ? state.kneeScores[state.kneeScores.length - 1] : null;
  const lastWeight = state.weighIns.length ? state.weighIns[state.weighIns.length - 1] : null;
  const doneToday = state.completedLog.some(l => l.date === todayISO());

  const lunch = MEALS.lunch[state.mealRotation.lunch];
  const dinner = MEALS.dinner[state.mealRotation.dinner];

  screenEl.innerHTML = `
    <p class="eyebrow">Today</p>
    <h1>${esc(prettyDate())}</h1>
    <p class="day-date">Up next in your rotation${state.travelMode ? " · Travel mode" : ""}</p>

    <div class="quickstrip">
      <div class="quick">
        <label>Morning knee</label>
        <div class="quick-row">
          <input id="knee-input" type="number" inputmode="numeric" min="0" max="10" placeholder="0–10" value="" />
          <button class="save" id="knee-save" aria-label="Save knee score">✓</button>
        </div>
        <div class="last">${lastKnee ? `Last: ${lastKnee.score}/10 · ${shortDate(lastKnee.date)}` : "Log 0–10"}</div>
      </div>
      <div class="quick">
        <label>Weight (lb)</label>
        <div class="quick-row">
          <input id="weight-input" type="number" inputmode="decimal" step="0.1" placeholder="lb" value="" />
          <button class="save" id="weight-save" aria-label="Save weight">✓</button>
        </div>
        <div class="last">${lastWeight ? `Last: ${lastWeight.weight} · ${shortDate(lastWeight.date)}` : "Log weight"}</div>
      </div>
    </div>

    <div class="card card-hero">
      <p class="eyebrow">Today's session</p>
      <h2>${esc(session.name)}</h2>
      ${session.sub ? `<p style="margin:0;font-size:13px;color:#CFE2F6">${esc(session.sub)}</p>` : ""}
      ${exerciseListHTML(session, true)}
    </div>

    <button class="btn-primary ${doneToday ? "done" : ""}" id="mark-done">
      ${doneToday ? "✓ Logged today — tap to log another" : "Mark workout done"}
    </button>

    ${weekStripHTML()}

    <div class="callout" style="margin-top:16px">
      <p style="margin:0;font-size:13.5px">${esc(KNEE_RULE)}</p>
    </div>

    <h2 style="margin-top:18px">Today's meals</h2>
    <div class="card">
      ${mealHTML(MEALS.breakfast)}
      ${mealHTML(lunch, "lunch", state.mealRotation.lunch)}
      ${mealHTML(dinner, "dinner", state.mealRotation.dinner)}
      ${mealHTML(MEALS.snack)}
    </div>
  `;

  // wire up
  document.getElementById("mark-done").onclick = () => {
    markWorkoutDone(state.travelMode ? "Travel" : slot);
  };
  document.getElementById("knee-save").onclick = saveKnee;
  document.getElementById("weight-save").onclick = saveWeight;
  wireWeekStrip();
  wireMealToggles();
}

function shortDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${+m}/${+d}`;
}

function mealHTML(meal, kind, current) {
  const toggle = kind ? `
    <div class="toggle-ab" data-kind="${kind}">
      <button data-val="A" class="${current === "A" ? "on" : ""}">A</button>
      <button data-val="B" class="${current === "B" ? "on" : ""}">B</button>
    </div>` : "";
  return `
    <div class="meal">
      <div class="meal-head">
        <span class="meal-title">${kind ? esc(kind[0].toUpperCase() + kind.slice(1)) + " — " : ""}${esc(meal.title)}</span>
        <span class="meal-kcal">${meal.kcal} kcal</span>
      </div>
      <div class="macro">P${meal.p} · F${meal.f} · C${meal.c}</div>
      <ul class="meal-items">${meal.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
      ${toggle}
    </div>`;
}

function wireMealToggles() {
  document.querySelectorAll(".toggle-ab").forEach(t => {
    t.querySelectorAll("button").forEach(b => {
      b.onclick = () => {
        state.mealRotation[t.dataset.kind] = b.dataset.val;
        save();
        render();
      };
    });
  });
}

function weekStripHTML() {
  const cells = ROTATION.map((slot, i) => {
    const isCursor = i === state.workoutCursor;
    const label = (SLOT_SHORT[slot] || slot).replace("\n", "<br>");
    return `<button class="wk ${isCursor ? "cursor" : ""}" data-idx="${i}">
        <span class="wk-dot">${slot === "Volleyball" ? "◯" : slot === "Rest" ? "·" : "■"}</span>
        <span>${label}</span>
      </button>`;
  }).join("");
  return `<div style="margin-top:18px"><p class="muted" style="margin:0 0 6px">This week — tap whichever you actually did</p>
    <div class="weekstrip">${cells}</div></div>`;
}

function wireWeekStrip() {
  document.querySelectorAll(".wk").forEach(c => {
    c.onclick = () => {
      const idx = +c.dataset.idx;
      const slot = ROTATION[idx];
      // Log this session and set cursor to the one after it.
      logCompletion(state.travelMode ? "Travel" : slot);
      state.workoutCursor = (idx + 1) % ROTATION.length;
      save();
      render();
    };
  });
}

function markWorkoutDone(type) {
  logCompletion(type);
  state.workoutCursor = (state.workoutCursor + 1) % ROTATION.length;
  save();
  render();
}
function logCompletion(type) {
  state.completedLog.push({ date: todayISO(), type, phase: state.currentPhase });
}

function saveKnee() {
  const el = document.getElementById("knee-input");
  let v = parseInt(el.value, 10);
  if (isNaN(v)) return;
  v = Math.max(0, Math.min(10, v));
  state.kneeScores.push({ date: todayISO(), score: v });
  save();
  render();
}
function saveWeight() {
  const el = document.getElementById("weight-input");
  const v = parseFloat(el.value);
  if (isNaN(v)) return;
  state.weighIns.push({ date: todayISO(), weight: Math.round(v * 10) / 10 });
  save();
  render();
}

/* ----- TRAIN ----- */
function renderTrain() {
  const phase = state.currentPhase;
  const info = PHASE_INFO[phase];

  const phaseTabs = [1, 2, 3].map(p =>
    `<button class="phase-tab ${p === phase ? "on" : ""}" data-phase="${p}">Phase ${p}</button>`
  ).join("");

  let sessionsHTML;
  if (state.travelMode) {
    sessionsHTML = `<div class="session card">
        <div class="session-name">${esc(TRAVEL_SESSION.name)}</div>
        <div class="session-sub">${esc(TRAVEL_SESSION.sub)}</div>
        ${exerciseListHTML(TRAVEL_SESSION)}
      </div>`;
  } else {
    // Show the distinct sessions for this phase (skip duplicate Volleyball/Rest beyond first).
    const order = ["Lower-Heavy", "Lower-Power", "Upper", "Volleyball", "Rest"];
    sessionsHTML = order.map(slot => {
      const s = sessionForSlot(phase, slot);
      return `<div class="session card">
          <div class="session-name">${esc(s.name)}</div>
          ${s.sub ? `<div class="session-sub">${esc(s.sub)}</div>` : ""}
          ${exerciseListHTML(s)}
        </div>`;
    }).join("");
  }

  screenEl.innerHTML = `
    <p class="eyebrow">Train</p>
    <h1>Your program</h1>

    <div class="phase-tabs">${phaseTabs}</div>
    <p class="phase-crit"><strong>${esc(info.title)}.</strong> ${esc(info.goal)}<br>${esc(info.entry)}</p>

    <div class="switch-row card" style="padding:14px 16px">
      <div>
        <div class="label">Travel mode</div>
        <div class="sub">Bodyweight + band fallback, no volleyball.</div>
      </div>
      <button class="switch ${state.travelMode ? "on" : ""}" id="travel-switch" aria-label="Travel mode"></button>
    </div>

    <div class="callout">
      <h3>${esc(RULES.cp.title)}</h3>
      <p>${esc(RULES.cp.body)}</p>
    </div>
    <div class="callout">
      <h3>${esc(RULES.tendon.title)}</h3>
      <p>${esc(RULES.tendon.body)}</p>
    </div>
    <div class="callout">
      <h3>${esc(RULES.hour24.title)}</h3>
      <p>${esc(RULES.hour24.body)}</p>
    </div>

    <h2 style="margin-top:18px">${state.travelMode ? "Travel session" : "Sessions this phase"}</h2>
    ${sessionsHTML}
  `;

  document.querySelectorAll(".phase-tab").forEach(b => {
    b.onclick = () => { state.currentPhase = +b.dataset.phase; save(); render(); };
  });
  document.getElementById("travel-switch").onclick = () => {
    state.travelMode = !state.travelMode; save(); render();
  };
}

/* ----- EAT ----- */
function renderEat() {
  const lunchA = MEALS.lunch.A, lunchB = MEALS.lunch.B;
  const dinnerA = MEALS.dinner.A, dinnerB = MEALS.dinner.B;

  // Today's selected total
  const lunch = MEALS.lunch[state.mealRotation.lunch];
  const dinner = MEALS.dinner[state.mealRotation.dinner];
  const tot = [MEALS.breakfast, lunch, dinner, MEALS.snack].reduce((a, m) =>
    ({ kcal: a.kcal + m.kcal, p: a.p + m.p, f: a.f + m.f, c: a.c + m.c }), { kcal: 0, p: 0, f: 0, c: 0 });

  screenEl.innerHTML = `
    <p class="eyebrow">Eat</p>
    <h1>Meal plan</h1>

    <div class="target-banner">
      <div class="big">~${TARGET.kcal} kcal</div>
      <div class="sub">Protein ${TARGET.p}g · Fat ${TARGET.f}g · Carbs ${TARGET.c}g</div>
    </div>
    <p class="muted" style="margin:-6px 0 14px;text-align:center">
      Today as selected (A/B): ${tot.kcal} kcal · P${tot.p} · F${tot.f} · C${tot.c}
    </p>

    <div class="card">${mealHTML(MEALS.breakfast)}</div>

    <h2>Lunch</h2>
    <div class="card">
      ${mealHTML(lunchA)}
      ${mealHTML(lunchB)}
      <div class="toggle-ab" data-kind="lunch" style="margin-top:6px">
        <button data-val="A" class="${state.mealRotation.lunch === "A" ? "on" : ""}">Today: A</button>
        <button data-val="B" class="${state.mealRotation.lunch === "B" ? "on" : ""}">Today: B</button>
      </div>
    </div>

    <h2>Dinner</h2>
    <div class="card">
      ${mealHTML(dinnerA)}
      ${mealHTML(dinnerB)}
      <div class="toggle-ab" data-kind="dinner" style="margin-top:6px">
        <button data-val="A" class="${state.mealRotation.dinner === "A" ? "on" : ""}">Today: A</button>
        <button data-val="B" class="${state.mealRotation.dinner === "B" ? "on" : ""}">Today: B</button>
      </div>
    </div>

    <div class="card">${mealHTML(MEALS.snack)}</div>

    <details class="fold">
      <summary>Travel / Restaurant Rules</summary>
      <ul>${TRAVEL_EAT_RULES.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
    </details>
  `;

  wireMealToggles();
}

/* ----- SHOP ----- */
function renderShop() {
  const sections = Object.entries(SHOPPING).map(([section, items]) => {
    const rows = items.map((label, i) => {
      const id = shopId(section, i);
      const checked = !!state.shoppingList[id];
      return `<div class="shop-item ${checked ? "checked" : ""}" data-id="${id}">
          <span class="shop-box">${checked ? "✓" : ""}</span>
          <span class="shop-name">${esc(label)}</span>
        </div>`;
    }).join("");
    return `<div class="shop-section card"><h3>${esc(section)}</h3>${rows}</div>`;
  }).join("");

  screenEl.innerHTML = `
    <p class="eyebrow">Shop</p>
    <h1>Shopping list</h1>
    <p class="day-date">Checks stay until you reset.</p>
    ${sections}
    <button class="btn-ghost" id="reset-shop" style="width:100%;margin-top:4px">Reset list</button>
  `;

  document.querySelectorAll(".shop-item").forEach(it => {
    it.onclick = () => {
      const id = it.dataset.id;
      state.shoppingList[id] = !state.shoppingList[id];
      save();
      it.classList.toggle("checked");
      it.querySelector(".shop-box").textContent = state.shoppingList[id] ? "✓" : "";
    };
  });
  document.getElementById("reset-shop").onclick = () => {
    state.shoppingList = {};
    save();
    render();
  };
}

/* ----- PROGRESS ----- */
function renderProgress() {
  const weighIns = state.weighIns.slice().sort((a, b) => a.date.localeCompare(b.date));
  const knee = state.kneeScores.slice().sort((a, b) => a.date.localeCompare(b.date));

  const rollingAvg = sevenDayAvg(weighIns);
  const currentAvg = rollingAvg != null ? rollingAvg : (weighIns.length ? weighIns[weighIns.length - 1].weight : null);
  const toGo = currentAvg != null ? Math.max(0, Math.round((currentAvg - GOAL_WEIGHT) * 10) / 10) : null;
  const lost = currentAvg != null ? Math.round((state.startWeight - currentAvg) * 10) / 10 : null;

  screenEl.innerHTML = `
    <p class="eyebrow">Progress</p>
    <h1>Where you stand</h1>

    <div class="stat-grid">
      <div class="stat"><div class="n">${state.startWeight}</div><div class="k">Start</div></div>
      <div class="stat"><div class="n">${GOAL_WEIGHT}</div><div class="k">Goal</div></div>
      <div class="stat"><div class="n">${currentAvg != null ? currentAvg : "—"}</div><div class="k">7-day avg</div></div>
      <div class="stat"><div class="n">${toGo != null ? toGo : "—"}</div><div class="k">lb to go</div></div>
    </div>
    ${lost != null ? `<p class="muted" style="margin:-4px 0 16px;text-align:center">Down ${lost} lb from start. Watch the average, not the daily.</p>` : ""}

    <div class="card">
      <h3>Weight — weekly average</h3>
      ${sparkline(weeklyAverages(weighIns).map(p => p.v), "#2E75B6")}
    </div>

    <div class="card">
      <h3>Morning knee score (0–10, lower is better)</h3>
      ${sparkline(knee.map(k => k.score), "#C7892B", 0, 10)}
    </div>

    <div class="card">
      <h3>Recent sessions</h3>
      ${state.completedLog.length
        ? `<ul class="log-list">${state.completedLog.slice(-12).reverse().map(l =>
            `<li><span>${esc(l.type)}</span><span class="muted">${shortDate(l.date)} · P${l.phase}</span></li>`).join("")}</ul>`
        : `<p class="spark-empty">No sessions logged yet. Mark one done on Today.</p>`}
    </div>
  `;
}

function sevenDayAvg(weighIns) {
  if (!weighIns.length) return null;
  const last = weighIns[weighIns.length - 1].date;
  const cutoff = new Date(last);
  cutoff.setDate(cutoff.getDate() - 6);
  const cutISO = cutoff.toISOString().slice(0, 10);
  const window = weighIns.filter(w => w.date >= cutISO);
  if (!window.length) return null;
  return Math.round((window.reduce((a, w) => a + w.weight, 0) / window.length) * 10) / 10;
}

// Group weigh-ins into ISO-week buckets and average each.
function weeklyAverages(weighIns) {
  const buckets = {};
  weighIns.forEach(w => {
    const d = new Date(w.date);
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    const key = d.getFullYear() + "-W" + week;
    (buckets[key] = buckets[key] || []).push(w.weight);
  });
  return Object.keys(buckets).sort().map(k => ({
    k, v: Math.round((buckets[k].reduce((a, b) => a + b, 0) / buckets[k].length) * 10) / 10,
  }));
}

function sparkline(values, color, forceMin, forceMax) {
  if (!values || values.length < 2) {
    return `<div class="spark-empty">Need at least 2 entries to chart.</div>`;
  }
  const W = 300, H = 90, pad = 8;
  const min = forceMin != null ? forceMin : Math.min(...values);
  const max = forceMax != null ? forceMax : Math.max(...values);
  const range = (max - min) || 1;
  const stepX = (W - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (H - pad * 2) * (1 - (v - min) / range);
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const dots = pts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.5" fill="${color}"/>`).join("");
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
    </svg>
    <div class="muted" style="display:flex;justify-content:space-between;margin-top:4px">
      <span>${values[0]}</span><span>${values[values.length - 1]} (latest)</span>
    </div>`;
}

/* ---------------------------------------------------------------
   Router
   --------------------------------------------------------------- */
function render() {
  switch (activeTab) {
    case "today": renderToday(); break;
    case "train": renderTrain(); break;
    case "eat": renderEat(); break;
    case "shop": renderShop(); break;
    case "progress": renderProgress(); break;
  }
  document.querySelectorAll(".tab").forEach(t =>
    t.classList.toggle("active", t.dataset.tab === activeTab));
  screenEl.scrollTop = 0;
  window.scrollTo(0, 0);
}

document.getElementById("tabbar").addEventListener("click", e => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  activeTab = tab.dataset.tab;
  render();
});

/* ---------------------------------------------------------------
   Onboarding + service worker
   --------------------------------------------------------------- */
function maybeShowOnboarding() {
  if (state.seenOnboarding) return;
  const ob = document.getElementById("onboarding");
  ob.classList.remove("hidden");
  document.getElementById("onboarding-dismiss").onclick = () => {
    state.seenOnboarding = true;
    save();
    ob.classList.add("hidden");
  };
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

// boot
render();
maybeShowOnboarding();
