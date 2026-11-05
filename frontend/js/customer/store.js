// Client state for the customer app. Every order mutation bumps `order.version`,
// matching the optimistic-concurrency contract in docs/API_CONTRACTS.md.
import {
  approveProposal, assistantReply, getDish, newOrder, priceOrder, qtyLabel, recommendedQty,
  validateContact, validateEvent,
} from "./mock-backend.js";
import { api } from "../api.js";
import { authHeaders } from "../supabase.js";

const STORAGE_KEY = "catering.customer.draft.v1";
export const STEPS = ["event", "menu", "summary", "status"];

let state = load() ?? fresh();
const listeners = new Set();

function fresh() {
  return { order: newOrder(), step: "event", chat: { open: false, busy: false, messages: [] } };
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved?.order) return null;
    return { order: saved.order, step: saved.step ?? "event", chat: { open: false, busy: false, messages: [] } };
  } catch {
    return null;
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ order: state.order, step: state.step }));
  } catch {
    /* storage unavailable (private mode, blocked): the app works without it */
  }
}

function commit(next) {
  state = next;
  persist();
  listeners.forEach((fn) => fn(state));
}

export const getState = () => state;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ---------------- navigation ---------------- */

export function canEnter(step, s = state) {
  if (s.order.status !== "draft") return step === "status";
  if (step === "event") return true;
  if (Object.keys(validateEvent(s.order.event)).length) return false;
  if (step === "menu") return true;
  if (step === "summary") return true;
  return false;
}

export function goto(step) {
  if (!canEnter(step)) return false;
  commit({ ...state, step, chat: step === "menu" || step === "summary" ? state.chat : { ...state.chat, open: false } });
  return true;
}

/* ---------------- order mutations ---------------- */

function mutateOrder(patch) {
  commit({ ...state, order: { ...state.order, ...patch, version: state.order.version + 1 } });
}

export function setEvent(patch) {
  mutateOrder({ event: { ...state.order.event, ...patch } });
}

export function setQty(dishId, qty) {
  const items = { ...state.order.items };
  if (qty > 0) items[dishId] = qty;
  else delete items[dishId];
  mutateOrder({ items });
}

export function addRecommended(dishId) {
  setQty(dishId, recommendedQty(getDish(dishId), state.order.event));
}

export function setContact(patch) {
  commit({ ...state, order: { ...state.order, contact: { ...state.order.contact, ...patch } } });
}

// Messages for backend error codes; anything else falls back to a generic retry message.
const SUBMIT_ERRORS = {
  date_too_soon: "התאריך קרוב מדי. נדרשים לפחות יומיים מראש.",
  date_blocked: "התאריך הזה סגור להזמנות. בחרו תאריך אחר.",
  delivery_zone_not_found: "אין עדיין משלוחים לעיר הזו. אפשר לבחור איסוף עצמי.",
  dish_unavailable: "חלק מהמנות כבר לא זמינות. הסירו אותן ונסו שוב.",
  unauthenticated: "פג תוקף הכניסה. היכנסו מחדש ונסו שוב.",
};

export async function submitOrder() {
  const { order } = state;
  const errors = { ...validateContact(order.contact) };
  if (!Object.keys(order.items).length) errors.items = "הוסיפו לפחות מנה אחת להזמנה";
  if (Object.keys(validateEvent(order.event)).length) errors.event = "פרטי האירוע חסרים או לא תקינים";
  if (Object.keys(errors).length) return { errors };

  // The backend prices the order and freezes the snapshot; the preview prices are not sent.
  let submitted;
  try {
    const headers = await authHeaders();
    const draft = await api("/api/orders", {
      method: "POST",
      headers,
      body: JSON.stringify({ event: order.event, items: order.items, contact: order.contact }),
    });
    submitted = await api(`/api/orders/${draft.id}/submit`, {
      method: "POST",
      headers,
      body: JSON.stringify({ version: draft.version }),
    });
  } catch (error) {
    return { errors: { submit: SUBMIT_ERRORS[error.code] ?? "לא הצלחנו לשלוח את הבקשה. נסו שוב בעוד רגע." } };
  }

  const snapshot = {
    submittedAt: submitted.submitted_at,
    lines: submitted.items.map((i) => {
      const dish = getDish(i.dish_id);
      const qty = Number(i.quantity);
      return { name: i.name, qty: dish ? qtyLabel(dish, qty) : String(qty), unitPrice: Number(i.unit_price), lineTotal: Number(i.line_total) };
    }),
    subtotal: Number(submitted.subtotal),
    deliveryFee: Number(submitted.delivery_fee),
    total: Number(submitted.total),
  };
  commit({
    ...state,
    step: "status",
    order: { ...order, serverId: submitted.id, status: submitted.status, snapshot, version: order.version + 1 },
    chat: { ...state.chat, open: false },
  });
  return { errors: {} };
}

/** Live status from the database; ignored if the customer has since started a new order. */
export function setServerStatus(serverId, status, ownerNote) {
  if (state.order.serverId !== serverId) return;
  if (state.order.status === status && state.order.ownerNote === (ownerNote ?? "")) return;
  commit({ ...state, order: { ...state.order, status, ownerNote: ownerNote ?? "" } });
}

/** Drop dishes no longer on the menu (e.g. a draft saved before the real menu loaded). */
export function pruneItems(validIds) {
  const items = Object.fromEntries(Object.entries(state.order.items).filter(([id]) => validIds.has(id)));
  if (Object.keys(items).length !== Object.keys(state.order.items).length) commit({ ...state, order: { ...state.order, items } });
}

export function startOver() {
  commit(fresh());
}

/* ---------------- design review helper ---------------- */
// ?demo=pending|approved|rejected seeds a submitted order so the status screen can be reviewed
// without clicking through the whole flow. Never used in production data.
export function seedDemo(kind) {
  const base = newOrder();
  base.event = { ...base.event, type: "בר או בת מצווה", date: "2026-11-20", slot: "12:00-14:00", fulfillment: "delivery", city: "תל אביב-יפו", address: "רחוב אחד העם 12", adults: 30, children: 8 };
  base.items = { d1: 4, d2: 3, d6: 3, d5: 4, d11: 3, d15: 4, d17: 38 };
  base.contact = { name: "נועה לוי", phone: "0501234567" };
  const pricing = priceOrder(base);
  base.snapshot = {
    submittedAt: new Date().toISOString(),
    lines: pricing.lines.map((l) => ({ name: l.dish.name, qty: qtyLabel(l.dish, l.qty), unitPrice: l.unitPrice, lineTotal: l.lineTotal })),
    subtotal: pricing.subtotal, deliveryFee: pricing.deliveryFee, total: pricing.total,
  };
  base.status = kind === "approved" ? "approved" : kind === "rejected" ? "rejected" : "pending_approval";
  if (kind === "rejected") base.ownerNote = "לא נוכל לספק את האירוע בתאריך המבוקש. נשמח לעזור בתאריך חלופי.";
  if (kind === "approved") base.ownerNote = "ההזמנה אושרה. ניצור קשר לתיאום שעת המשלוח.";
  commit({ order: base, step: "status", chat: { open: false, busy: false, messages: [] } });
}

/* ---------------- assistant chat ---------------- */

export function setChatOpen(open) {
  commit({ ...state, chat: { ...state.chat, open } });
}

let messageSeq = 0;
const newMessage = (role, text, proposals = []) => ({ id: `m-${++messageSeq}`, role, text, proposals });

export function sendChat(text) {
  const clean = text.trim();
  if (!clean || state.chat.busy) return;
  const order = state.order;
  commit({ ...state, chat: { ...state.chat, busy: true, messages: [...state.chat.messages, newMessage("user", clean)] } });
  // Simulated latency; the real endpoint is POST /api/orders/{id}/chat.
  setTimeout(() => {
    const { reply, proposals } = assistantReply(order, clean);
    commit({ ...state, chat: { ...state.chat, busy: false, messages: [...state.chat.messages, newMessage("assistant", reply, proposals)] } });
  }, 700);
}

/** Display status: a pending proposal whose base version is stale is shown as expired. */
export function proposalStatus(proposal) {
  if (proposal.status === "pending" && proposal.base_order_version !== state.order.version) return "expired";
  return proposal.status;
}

function patchProposal(id, status) {
  const messages = state.chat.messages.map((m) => ({
    ...m,
    proposals: m.proposals.map((p) => (p.id === id ? { ...p, status } : p)),
  }));
  commit({ ...state, chat: { ...state.chat, messages } });
}

export function rejectProposal(id) {
  patchProposal(id, "rejected");
}

export function approveProposalById(id) {
  const proposal = state.chat.messages.flatMap((m) => m.proposals).find((p) => p.id === id);
  if (!proposal || proposalStatus(proposal) !== "pending") return;
  patchProposal(id, "applying");
  // Simulated round trip; the real endpoint executes in one transaction against the current version.
  setTimeout(() => {
    const outcome = approveProposal(state.order, { ...proposal, status: "pending" });
    if (outcome.error) {
      patchProposal(id, outcome.error === "order_version_conflict" ? "expired" : "rejected");
      return;
    }
    const messages = state.chat.messages.map((m) => ({
      ...m,
      proposals: m.proposals.map((p) => (p.id === id ? { ...p, status: "applied" } : p)),
    }));
    commit({ ...state, order: outcome.order, chat: { ...state.chat, messages } });
  }, 450);
}
