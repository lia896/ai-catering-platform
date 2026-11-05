import { play } from "../lib/motion.js";
import { renderStepper } from "./components/stepper.js";
import { mountChat } from "./components/chat.js";
import { DISHES, EVENT_TYPES, loadCatalog, validateEvent } from "./mock-backend.js";
import {
  STEPS, canEnter, getState, goto, pruneItems, seedDemo, setContact, setEvent, setServerStatus, subscribe,
} from "./store.js";
import { getSession, supabase } from "../supabase.js";
import { mountEvent } from "./views/event.js";
import { mountMenu } from "./views/menu.js";
import { mountStatus } from "./views/status.js";
import { mountSummary } from "./views/summary.js";

const VIEWS = { event: mountEvent, menu: mountMenu, summary: mountSummary, status: mountStatus };
const TITLES = {
  event: "פרטי האירוע",
  menu: "בחירת תפריט",
  summary: "סיכום ההזמנה",
  status: "מצב הבקשה",
};

const app = document.getElementById("app");
const stepperRoot = document.getElementById("stepper");

// Design review shortcut: ?demo=pending|approved|rejected, or #demo-pending etc. when the
// page is embedded and has no query string. Runs on the built-in sample menu, without sign-in.
const demo = new URLSearchParams(location.search).get("demo") ?? location.hash.replace(/^#demo-/, "");
const demoMode = ["pending", "approved", "rejected"].includes(demo);
if (demoMode) seedDemo(demo);
else await bootLive();

async function bootLive() {
  const session = await getSession();
  if (!session) {
    location.replace(`/login/?next=${encodeURIComponent(`/customer/${location.search}`)}`);
    await new Promise(() => {}); // stop here while the browser navigates
  }
  supabase.realtime.setAuth(session.access_token);
  try {
    await loadCatalog();
  } catch {
    app.textContent = "לא הצלחנו לטעון את התפריט. כדאי לרענן את הדף בעוד רגע.";
    await new Promise(() => {});
  }
  pruneItems(new Set(DISHES.map((d) => d.id)));
  // Prefill contact details from the customer's profile (RLS returns only their own row).
  const { data: me } = await supabase.from("customers").select("full_name, phone").maybeSingle();
  const { contact } = getState().order;
  if (me) setContact({ name: contact.name || me.full_name || "", phone: contact.phone || me.phone || "" });
}

// Live order status: the owner's decision reaches the status screen without a reload.
let watched = null;
function watchOrder(state) {
  const id = state.order.serverId;
  if (demoMode || !id || id === watched || state.order.status === "draft") return;
  watched = id;
  supabase.from("orders").select("status, decision_note").eq("id", id).maybeSingle()
    .then(({ data }) => data && setServerStatus(id, data.status, data.decision_note));
  supabase.channel(`order-${id}`)
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
      ({ new: row }) => setServerStatus(id, row.status, row.decision_note))
    .subscribe();
}

// Landing-page occasion cards link here with ?occasion=<event type> to preselect it.
const occasion = new URLSearchParams(location.search).get("occasion");
if (occasion && EVENT_TYPES.includes(occasion) && getState().order.status === "draft") setEvent({ type: occasion });

let currentStep = null;
let currentView = null;
let cleanup = null;
let stepperSig = null;
let firstRender = true;

function render(state) {
  // Never show a screen the order cannot be in (e.g. a stale saved step).
  if (!canEnter(state.step, state)) {
    const fallback = state.order.status !== "draft" ? "status" : "event";
    if (state.step !== fallback) {
      goto(fallback);
      return;
    }
  }

  const sig = `${state.step}|${state.order.status}|${Object.keys(validateEvent(state.order.event)).length === 0}`;
  if (sig !== stepperSig) {
    stepperSig = sig;
    renderStepper(stepperRoot);
  }

  // The status screen also redraws when the owner's decision arrives.
  const viewKey = state.step === "status" ? `status|${state.order.status}|${state.order.ownerNote}` : state.step;
  if (viewKey === currentView) return;
  cleanup?.();
  currentView = viewKey;
  currentStep = state.step;
  cleanup = VIEWS[currentStep](app);
  play(app, "enter"); // each step arrives with a short rise; skipped for reduced motion
  document.title = `${TITLES[currentStep]} | yumm.ai`;

  // Assigning the hash adds a history entry and works in sandboxed frames, where pushState can throw.
  if (location.hash !== `#${currentStep}`) location.hash = currentStep;
  if (!firstRender) {
    window.scrollTo({ top: 0 });
    const heading = app.querySelector("h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }
  firstRender = false;
}

window.addEventListener("hashchange", () => {
  const wanted = location.hash.slice(1);
  if (STEPS.includes(wanted) && wanted !== getState().step) {
    if (!goto(wanted)) location.hash = getState().step;
  }
});

mountChat(document.getElementById("chat-root"));
subscribe(render);
subscribe(watchOrder);
render(getState());
watchOrder(getState());
