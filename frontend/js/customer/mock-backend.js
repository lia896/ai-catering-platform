// Catalog data and client-side helpers for the customer app.
// The menu, categories and delivery zones come from the backend (loadCatalog); the arrays below
// are the design-review fallback used with ?demo=. The backend is authoritative for prices and
// order state (ADR-0003); priceOrder here is only the live preview. Values marked PLACEHOLDER
// are NOT business rules.

import { api } from "../api.js";
import { addDays, toIsoDate } from "../lib/format.js";

export const CATEGORIES = [
  { id: "salads", name: "סלטים ומטבלים" },
  { id: "mains", name: "עיקריות" },
  { id: "fish", name: "דגים" },
  { id: "sides", name: "תוספות ולחמים" },
  { id: "desserts", name: "קינוחים" },
  { id: "drinks", name: "שתייה" },
];

export const UNIT_LABELS = { tray: "מגש", kg: "ק״ג", item: "יחידה", guest: "לאורח" };

// allergens: array = verified list ([] means verified none); null = unknown, never shown as safe.
export const DISHES = [
  { id: "d1", categoryId: "salads", name: "חומוס ביתי", description: "חומוס חם עם טחינה גולמית, שמן זית ופפריקה.", price: 85, unit: "tray", kashrut: "pareve", vegetarian: true, vegan: true, allergens: ["שומשום"] },
  { id: "d2", categoryId: "salads", name: "סלט חצילים קלויים", description: "חצילים שרופים על האש עם טחינה, לימון ופטרוזיליה.", price: 90, unit: "tray", kashrut: "pareve", vegetarian: true, vegan: true, allergens: [] },
  { id: "d3", categoryId: "salads", name: "סלט סלק וגבינת עיזים", description: "סלק אפוי, גבינת עיזים, אגוזי מלך וויניגרט הדרים.", price: 110, unit: "tray", kashrut: "dairy", vegetarian: true, vegan: false, allergens: ["חלב", "אגוזים"] },
  { id: "d4", categoryId: "salads", name: "טבולה פטרוזיליה", description: "פטרוזיליה קצוצה, בורגול, עגבניות ולימון.", price: 80, unit: "tray", kashrut: "pareve", vegetarian: true, vegan: true, allergens: ["גלוטן"] },
  { id: "d5", categoryId: "mains", name: "עוף בתנור בעשבי תיבול", description: "ירכי עוף אפויות עם שום, רוזמרין ולימון.", price: 74, unit: "kg", kashrut: "meat", vegetarian: false, vegan: false, allergens: [] },
  { id: "d6", categoryId: "mains", name: "קציצות בקר ברוטב עגבניות", description: "קציצות בקר רכות ברוטב עגבניות וכוסברה.", price: 240, unit: "tray", kashrut: "meat", vegetarian: false, vegan: false, allergens: ["גלוטן", "ביצים"] },
  { id: "d7", categoryId: "mains", name: "פשטידת ברוקולי וגבינות", description: "פשטידה אפויה עם ברוקולי ושלוש גבינות.", price: 190, unit: "tray", kashrut: "dairy", vegetarian: true, vegan: false, allergens: ["חלב", "גלוטן", "ביצים"] },
  { id: "d8", categoryId: "mains", name: "תבשיל קדרה צמחי", description: "ירקות עונה, חומוס ותבלינים בבישול איטי.", price: 170, unit: "tray", kashrut: "pareve", vegetarian: true, vegan: true, allergens: null },
  { id: "d9", categoryId: "fish", name: "פילה סלמון בלימון", description: "פילה סלמון אפוי עם לימון, שמיר ושמן זית.", price: 98, unit: "item", perGuest: 0.6, step: 1, kashrut: "pareve", vegetarian: false, vegan: false, allergens: ["דגים"] },
  { id: "d10", categoryId: "fish", name: "דג מושט בצ׳רמולה", description: "דג מושט שלם בתנור עם צ׳רמולה ביתית.", price: 145, unit: "kg", kashrut: "pareve", vegetarian: false, vegan: false, allergens: ["דגים"] },
  { id: "d11", categoryId: "sides", name: "אורז בסמטי ושקדים", description: "אורז בסמטי עם שקדים קלויים ובצל מקורמל.", price: 120, unit: "tray", kashrut: "pareve", vegetarian: true, vegan: true, allergens: ["אגוזים"] },
  { id: "d12", categoryId: "sides", name: "ירקות שורש קלויים", description: "גזר, בטטה וסלק קלויים עם דבש או סילאן.", price: 105, unit: "tray", kashrut: "pareve", vegetarian: true, vegan: true, allergens: [] },
  { id: "d13", categoryId: "sides", name: "פוקאצ׳ה ביתית", description: "פוקאצ׳ה אפויה עם רוזמרין ומלח גס.", price: 18, unit: "item", perGuest: 1.5, step: 4, kashrut: "pareve", vegetarian: true, vegan: true, allergens: ["גלוטן"] },
  { id: "d14", categoryId: "desserts", name: "עוגת שוקולד ללא קמח", description: "עוגת שוקולד מריר לחה, 12 פרוסות.", price: 160, unit: "item", perGuest: 0.1, step: 1, kashrut: "pareve", vegetarian: true, vegan: false, allergens: ["ביצים", "אגוזים"] },
  { id: "d15", categoryId: "desserts", name: "פלטת פירות העונה", description: "פירות טריים חתוכים, לכ-10 סועדים.", price: 140, unit: "item", perGuest: 0.1, step: 1, kashrut: "pareve", vegetarian: true, vegan: true, allergens: [] },
  { id: "d16", categoryId: "desserts", name: "מיני טארטלטים", description: "טארטלטים עם קרם וניל ופירות יער.", price: 9, unit: "item", perGuest: 2, step: 6, kashrut: "dairy", vegetarian: true, vegan: false, allergens: ["חלב", "גלוטן", "ביצים"] },
  { id: "d17", categoryId: "drinks", name: "שתייה קלה ומים", description: "מבחר שתייה קלה ומים מינרליים לכל אורח.", price: 14, unit: "guest", kashrut: "pareve", vegetarian: true, vegan: true, allergens: [] },
];

// "יום נישואין" (anniversary) added for the illustrated occasion picker; the client brief lists it as an occasion.
export const EVENT_TYPES = ["יום הולדת", "אירוע משפחתי", "בר או בת מצווה", "ארוחת שבת", "יום נישואין", "חגיגה פרטית", "אחר"];

// PLACEHOLDER zones and fees (OPEN #19).
export const ZONES = [
  { city: "תל אביב-יפו", fee: 60 },
  { city: "רמת גן", fee: 60 },
  { city: "גבעתיים", fee: 60 },
  { city: "הרצליה", fee: 90 },
  { city: "פתח תקווה", fee: 100 },
  { city: "ראשון לציון", fee: 110 },
];

// PLACEHOLDER slots (OPEN #5).
const SLOTS = {
  pickup: ["10:00-12:00", "12:00-14:00", "15:00-17:00"],
  delivery: ["09:00-11:00", "11:00-13:00", "14:00-16:00"],
};

// PLACEHOLDER minimum lead time (OPEN #5); the backend's value replaces it in loadCatalog.
let leadDays = 2;
// Closed dates from the database; null until loaded (demo mode keeps the sample dates).
let blocked = null;

const UNIT_FROM_API = { per_tray: "tray", per_weight: "kg", per_item: "item", per_guest: "guest" };

/** Replace the demo catalog with the real one, in place, so every importer sees it. */
export async function loadCatalog() {
  const [categories, dishes, zones, availability] = await Promise.all([
    api("/api/catalog/categories"), api("/api/catalog/dishes"), api("/api/catalog/delivery-zones"),
    api("/api/availability"),
  ]);
  SLOTS.pickup = availability.slots.pickup;
  SLOTS.delivery = availability.slots.delivery;
  leadDays = availability.lead_days;
  blocked = availability.blocked_dates;
  // shortcut: per-guest portions and counter steps aren't in the database yet (OPEN #3), so they
  // are borrowed from the demo dish with the same name; move them to quantity_rules once decided.
  const hints = new Map(DISHES.map((d) => [d.name, { perGuest: d.perGuest, step: d.step }]));
  CATEGORIES.splice(0, CATEGORIES.length, ...categories);
  DISHES.splice(0, DISHES.length, ...dishes.map((d) => ({
    id: d.id,
    categoryId: d.category_id,
    name: d.name,
    description: d.description,
    image: d.image_url,
    price: Number(d.unit_price),
    unit: UNIT_FROM_API[d.pricing_unit],
    kashrut: d.kashrut,
    vegetarian: d.is_vegetarian,
    vegan: d.is_vegan,
    // A full verified list, or null (unknown) - never presented as safe.
    allergens: d.allergens_complete ? d.allergens.filter((a) => a.status === "contains").map((a) => a.name) : null,
    ...hints.get(d.name),
  })));
  ZONES.splice(0, ZONES.length, ...zones.flatMap((z) => z.cities.map((city) => ({ city, fee: Number(z.fee) }))));
}

export function minEventDate() {
  return toIsoDate(addDays(new Date(), leadDays));
}

export function blockedDates() {
  if (blocked) return blocked;
  return [toIsoDate(addDays(new Date(), 5)), toIsoDate(addDays(new Date(), 11))];
}

export function slotsFor(fulfillment) {
  return SLOTS[fulfillment] ?? [];
}

export const getDish = (id) => DISHES.find((d) => d.id === id);
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id);

export function unitStep(dish) {
  if (dish.step) return dish.step;
  return dish.unit === "kg" ? 0.5 : 1;
}

export function totalGuests(event) {
  return (Number(event.adults) || 0) + (Number(event.children) || 0);
}

/** PLACEHOLDER quantity rules (OPEN #3). Children count as half a portion. */
export function recommendedQty(dish, event) {
  const effective = (Number(event.adults) || 0) + (Number(event.children) || 0) * 0.5;
  if (effective <= 0) return 0;
  const step = unitStep(dish);
  const roundUp = (n) => Math.ceil(n / step - 1e-9) * step;
  if (dish.unit === "guest") return totalGuests(event);
  if (dish.unit === "tray") return Math.max(1, Math.ceil(effective / 8));
  if (dish.unit === "kg") return Math.max(step, roundUp(effective * 0.2));
  return Math.max(step, roundUp(effective * (dish.perGuest ?? 1)));
}

export function validateEvent(event) {
  const errors = {};
  if (!event.type) errors.type = "בחרו סוג אירוע";
  if (!event.date) errors.date = "בחרו תאריך לאירוע";
  else if (event.date < minEventDate()) errors.date = "התאריך קרוב מדי. נדרשים לפחות יומיים מראש.";
  else if (blockedDates().includes(event.date)) errors.date = "התאריך הזה סגור להזמנות. בחרו תאריך אחר.";
  if (!event.slot) errors.slot = "בחרו חלון זמן";
  if (!(Number(event.adults) >= 1)) errors.adults = "יש להזין לפחות מבוגר אחד";
  const total = totalGuests(event);
  if (Number(event.vegetarian) + Number(event.vegan) + Number(event.restricted) > total) {
    errors.dietary = "מספר האורחים עם הגבלות תזונתיות גדול ממספר האורחים הכולל";
  }
  if (event.fulfillment === "delivery") {
    if (!event.city) errors.city = "בחרו עיר למשלוח";
    if (!event.address?.trim()) errors.address = "הזינו כתובת למשלוח";
  }
  return errors;
}

export function validateContact(contact) {
  const errors = {};
  if (!contact.name?.trim()) errors.name = "הזינו שם מלא";
  if (!/^0\d{8,9}$/.test((contact.phone ?? "").replace(/[-\s]/g, ""))) errors.phone = "הזינו מספר טלפון ישראלי תקין";
  return errors;
}

export function newOrder() {
  return {
    id: "draft-local",
    version: 1,
    status: "draft",
    event: {
      type: "", date: "", slot: "", fulfillment: "pickup", city: "", address: "",
      adults: 20, children: 0, vegetarian: 0, vegan: 0, restricted: 0, notes: "",
    },
    items: {},
    contact: { name: "", phone: "" },
    ownerNote: "",
    snapshot: null,
  };
}

const round2 = (n) => Math.round(n * 100) / 100;

export function priceOrder(order) {
  const lines = Object.entries(order.items)
    .map(([dishId, qty]) => {
      const dish = getDish(dishId);
      return { dish, qty, unitPrice: dish.price, lineTotal: round2(dish.price * qty) };
    })
    .sort((a, b) => DISHES.indexOf(a.dish) - DISHES.indexOf(b.dish));
  const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));
  const zone = ZONES.find((z) => z.city === order.event.city);
  const deliveryFee = order.event.fulfillment === "delivery" ? (zone ? zone.fee : null) : 0;
  return { lines, subtotal, deliveryFee, total: round2(subtotal + (deliveryFee ?? 0)) };
}

export function missingCategories(order) {
  const picked = new Set(Object.keys(order.items).map((id) => getDish(id).categoryId));
  return ["salads", "mains", "sides", "desserts"].filter((c) => !picked.has(c)).map(getCategory);
}

const UNIT_PLURAL = { tray: "מגשים", kg: "ק״ג", item: "יחידות", guest: "אורחים" };

export function qtyLabel(dish, qty) {
  const q = Number.isInteger(qty) ? String(qty) : qty.toLocaleString("he-IL");
  if (dish.unit === "guest") return qty === 1 ? "אורח אחד" : `${q} אורחים`;
  return `${q} ${qty === 1 ? UNIT_LABELS[dish.unit] : UNIT_PLURAL[dish.unit]}`;
}

/* ---------------- changes, diffs and proposals ---------------- */

export function applyChanges(order, changes) {
  const items = { ...order.items };
  for (const c of changes) {
    if (c.op === "add_item" || c.op === "set_quantity") items[c.dish_id] = c.quantity;
    if (c.op === "remove_item") delete items[c.dish_id];
  }
  return { ...order, items, version: order.version + 1 };
}

function diffFor(order, changes) {
  return changes.map((c) => {
    const dish = getDish(c.dish_id);
    const current = order.items[c.dish_id];
    if (c.op === "add_item") return { label: dish.name, current: "לא בהזמנה", proposed: qtyLabel(dish, c.quantity) };
    if (c.op === "remove_item") return { label: dish.name, current: qtyLabel(dish, current), proposed: "יוסר מההזמנה" };
    return { label: dish.name, current: qtyLabel(dish, current), proposed: qtyLabel(dish, c.quantity) };
  });
}

let proposalSeq = 0;
function makeProposal(order, changes) {
  return {
    id: `p-${++proposalSeq}`,
    base_order_version: order.version,
    changes,
    diff: diffFor(order, changes),
    price_before: priceOrder(order).total,
    price_after: priceOrder(applyChanges(order, changes)).total,
    status: "pending",
  };
}

/** Returns "applied" outcome or an error code, mimicking the approve endpoint. */
export function approveProposal(order, proposal) {
  if (proposal.status !== "pending") return { error: "proposal_not_pending" };
  if (proposal.base_order_version !== order.version) return { error: "order_version_conflict" };
  return { order: applyChanges(order, proposal.changes) };
}

/* ---------------- scripted assistant (UI stand-in for Phase 4) ---------------- */
// Only ever mentions dishes that exist in DISHES and never treats unknown allergens as safe.

const ALLERGEN_WORDS = ["גלוטן", "אגוזים", "חלב", "ביצים", "שומשום", "דגים"];

export function suggestedPrompts() {
  return ["מה כדאי להוסיף לאירוע?", "האם הכמויות מספיקות?", "יש לנו אורחים צמחונים, מה מתאים?", "אילו מנות מכילות גלוטן?"];
}

export function assistantReply(order, rawText) {
  const text = rawText.trim();
  const inOrder = Object.keys(order.items);
  const reply = (message, changes) => ({ reply: message, proposals: changes ? [makeProposal(order, changes)] : [] });

  const allergen = ALLERGEN_WORDS.find((a) => text.includes(a));
  if (allergen) {
    if (!inOrder.length) return reply(`ההזמנה עדיין ריקה. אפשר לבדוק לגבי ${allergen} אחרי שתבחרו מנות.`);
    const contains = inOrder.map(getDish).filter((d) => d.allergens?.includes(allergen));
    const unknown = inOrder.map(getDish).filter((d) => d.allergens === null);
    const parts = [contains.length ? `לפי המידע שהוזן לעסק, ${allergen} מופיע ב: ${contains.map((d) => d.name).join(", ")}.` : `אין בהזמנה מנות שמסומנות כמכילות ${allergen}.`];
    if (unknown.length) parts.push(`אין מידע על אלרגנים עבור: ${unknown.map((d) => d.name).join(", ")}. אי אפשר להניח שהן בטוחות.`);
    parts.push("מומלץ לוודא מול העסק לפני האירוע.");
    return reply(parts.join(" "));
  }

  if (/קינוח|מתוק|עוגה|סוכר/.test(text)) {
    const hasDessert = inOrder.some((id) => getDish(id).categoryId === "desserts");
    if (hasDessert) return reply("כבר יש בהזמנה קינוח. אפשר לשנות את הכמות בסיכום ההזמנה.");
    const dish = DISHES.find((d) => d.name === "פלטת פירות העונה") ?? DISHES.find((d) => d.categoryId === "desserts" && d.vegan);
    if (!dish) return reply("כרגע אין בתפריט קינוח שמתאים לכולם.");
    return reply(`אפשר להוסיף את ${dish.name}, שמתאימה גם לאורחים טבעוניים.`, [{ op: "add_item", dish_id: dish.id, quantity: recommendedQty(dish, order.event) }]);
  }

  if (/צמחוני|טבעוני|טבעונים|צמחונים/.test(text)) {
    const candidates = DISHES.filter((d) => d.vegan && ["mains", "sides"].includes(d.categoryId) && !(d.id in order.items));
    if (!candidates.length) return reply("כל המנות הטבעוניות מהקטגוריות העיקריות כבר בהזמנה.");
    const dish = candidates[0];
    const note = dish.allergens === null ? " שימו לב: אין לעסק מידע על אלרגנים במנה הזו." : "";
    return reply(`${dish.name} מסומנת כטבעונית ומתאימה כמנה עיקרית.${note}`, [{ op: "add_item", dish_id: dish.id, quantity: recommendedQty(dish, order.event) }]);
  }

  if (/מחיר|יקר|תקציב|לחסוך|חיסכון|זול/.test(text)) {
    const { lines, total } = priceOrder(order);
    if (!lines.length) return reply("ההזמנה עדיין ריקה, אז אין מה לחסוך.");
    const top = [...lines].sort((a, b) => b.lineTotal - a.lineTotal)[0];
    const step = unitStep(top.dish);
    if (top.qty - step < step) return reply(`המנה היקרה ביותר היא ${top.dish.name}, וכבר בכמות המינימלית. הסכום הכולל הוא ${total} ש״ח.`);
    return reply(`המנה שתורמת הכי הרבה לסכום היא ${top.dish.name}. אפשר להקטין מעט את הכמות.`, [{ op: "set_quantity", dish_id: top.dish.id, quantity: top.qty - step }]);
  }

  if (/כמות|כמויות|מספיק|מספיקה|כמה/.test(text)) {
    const short = inOrder.map(getDish).find((d) => order.items[d.id] < recommendedQty(d, order.event));
    if (!inOrder.length) return reply("ההזמנה עדיין ריקה. בחרו מנות ואבדוק אם הכמויות מתאימות.");
    if (!short) return reply("לפי כללי הכמויות של העסק, הכמויות בהזמנה מתאימות למספר האורחים.");
    const rec = recommendedQty(short, order.event);
    return reply(`עבור ${totalGuests(order.event)} אורחים, הכמות המומלצת של ${short.name} היא ${qtyLabel(short, rec)}.`, [{ op: "set_quantity", dish_id: short.id, quantity: rec }]);
  }

  if (/המלצ|כדאי|להוסיף|מה יש|תפריט|חסר/.test(text)) {
    const missing = missingCategories(order);
    if (!missing.length) return reply("יש בהזמנה מנות מכל הקטגוריות המרכזיות. אפשר לשאול אותי על כמויות, אלרגנים או מחיר.");
    const cat = missing[0];
    const dish = DISHES.find((d) => d.categoryId === cat.id && !(d.id in order.items));
    return reply(`עדיין אין בהזמנה מנות מהקטגוריה "${cat.name}". אפשר להתחיל עם ${dish.name}.`, [{ op: "add_item", dish_id: dish.id, quantity: recommendedQty(dish, order.event) }]);
  }

  return reply("אני יכול לעזור עם המלצות על מנות מהתפריט, כמויות, מחיר ומידע על אלרגנים. שום שינוי בהזמנה לא יתבצע בלי האישור שלכם.");
}
