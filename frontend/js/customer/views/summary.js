// C3 + C5 (review): itemized pricing, recommendation hints, contact details, explicit submit.
import { fill, h, icon } from "../../lib/dom.js";
import { announce } from "../../lib/announce.js";
import { fmtDate, fmtMoney, fmtNumber } from "../../lib/format.js";
import { animatedAmount } from "../../lib/motion.js";
import {
  UNIT_LABELS, missingCategories, priceOrder, qtyLabel, totalGuests, unitStep,
} from "../mock-backend.js";
import { getState, goto, setContact, setQty, subscribe, submitOrder } from "../store.js";

export function mountSummary(root) {
  const linesBox = h("div", { class: "lines-box" });
  const totalsBox = h("div", { class: "totals" });
  const hintsBox = h("div", { class: "stack" });
  const itemsError = h("p", { class: "error", hidden: true, role: "alert" });
  let lastItems = null;
  let lastTotal = null;

  /* ----- contact form ----- */
  const contact = getState().order.contact;
  const nameErr = h("p", { class: "error", id: "err-name", hidden: true });
  const phoneErr = h("p", { class: "error", id: "err-phone", hidden: true });
  const name = h("input", { id: "f-name", class: "input", type: "text", autocomplete: "name", value: contact.name, "aria-describedby": "err-name" });
  const phone = h("input", { id: "f-phone", class: "input", type: "tel", autocomplete: "tel", inputmode: "tel", value: contact.phone, "aria-describedby": "hint-phone err-phone", dir: "ltr" });
  name.addEventListener("input", () => setContact({ name: name.value }));
  phone.addEventListener("input", () => setContact({ phone: phone.value }));

  function showErr(el, input, message) {
    el.hidden = !message;
    fill(el, ...(message ? [icon("warning"), message] : []));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    input.closest(".field").classList.toggle("invalid", Boolean(message));
  }

  const recap = h("dl", { class: "recap" });
  function renderRecap(state) {
    const e = state.order.event;
    const rows = [
      ["אירוע", `${e.type}, ${fmtDate(e.date)}`],
      ["אורחים", `${fmtNumber(totalGuests(e))} (${e.adults} מבוגרים, ${e.children} ילדים)`],
      [e.fulfillment === "delivery" ? "משלוח" : "איסוף", e.fulfillment === "delivery" ? `${e.address}, ${e.city}, ${e.slot}` : `מהעסק, ${e.slot}`],
    ];
    fill(recap, rows.map(([k, v]) => h("div", { class: "recap-row" }, h("dt", { text: k }), h("dd", { text: v }))));
  }

  const submitBtn = h("button", { class: "btn btn-primary btn-block", type: "submit" }, "שליחת בקשה להצעת מחיר");

  const form = h("form", { class: "panel stack", novalidate: true, onsubmit: async (ev) => {
    ev.preventDefault();
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
    const { errors } = await submitOrder();
    submitBtn.disabled = false;
    submitBtn.removeAttribute("aria-busy");
    showErr(nameErr, name, errors.name);
    showErr(phoneErr, phone, errors.phone);
    // The same alert box carries "no dishes" and server-side refusals (date closed, zone, session).
    const message = errors.items ?? errors.submit;
    itemsError.hidden = !message;
    fill(itemsError, ...(message ? [icon("warning"), message] : []));
    if (errors.submit) itemsError.scrollIntoView({ block: "center" });
    const firstInvalid = root.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    else if (errors.items) itemsError.scrollIntoView({ block: "center" });
  } },
    h("h2", { text: "פרטים ליצירת קשר" }),
    h("div", { class: "grid-2" },
      h("div", { class: "field" }, h("label", { for: "f-name", text: "שם מלא" }), name, nameErr),
      h("div", { class: "field" }, h("label", { for: "f-phone", text: "טלפון" }), phone,
        h("p", { class: "hint", id: "hint-phone", text: "העסק ייצור איתכם קשר בנוגע לבקשה." }), phoneErr),
    ),
    itemsError,
    h("div", { class: "callout" }, icon("info"),
      h("p", {}, "שליחה היא בקשה להצעת מחיר, ", h("strong", { text: "לא הזמנה מאושרת" }), ". ההזמנה תיחשב מאושרת רק לאחר שהעסק יאשר אותה.")),
    submitBtn,
  );

  /* ----- layout ----- */
  fill(root, 
    h("h1", { class: "page-title", text: "סיכום ההזמנה" }),
    h("p", { class: "page-lead muted", text: "בדקו את המנות, הכמויות והמחיר לפני השליחה." }),
    h("div", { class: "summary-layout" },
      h("div", { class: "stack-lg" },
        h("section", { class: "panel stack", "aria-labelledby": "lines-title" },
          h("div", { class: "panel-head" },
            h("h2", { id: "lines-title", text: "המנות שלכם" }),
            h("button", { class: "btn btn-ghost", type: "button", onclick: () => goto("menu") }, icon("plus"), "הוספת מנות")),
          linesBox, totalsBox),
        hintsBox,
      ),
      h("div", { class: "stack-lg" },
        h("section", { class: "panel stack" },
          h("div", { class: "panel-head" }, h("h2", { text: "פרטי האירוע" }),
            h("button", { class: "btn btn-ghost", type: "button", onclick: () => goto("event") }, "עריכה")),
          recap),
        form,
      ),
    ),
  );

  /* ----- rendering ----- */
  function renderLines(state) {
    const pricing = priceOrder(state.order);
    const focusKey = linesBox.contains(document.activeElement) ? document.activeElement.dataset.key : null;

    if (!pricing.lines.length) {
      fill(linesBox, h("div", { class: "empty" },
        h("p", { class: "empty-title", text: "ההזמנה ריקה" }),
        h("p", { class: "muted", text: "בחרו לפחות מנה אחת כדי לשלוח בקשה." }),
        h("button", { class: "btn btn-primary", type: "button", onclick: () => goto("menu") }, "חזרה לתפריט")));
    } else {
      fill(linesBox, h("ul", { class: "lines" }, pricing.lines.map(({ dish, qty, unitPrice, lineTotal }) => {
        const step = unitStep(dish);
        return h("li", { class: "line" },
          h("div", { class: "line-info" },
            h("strong", { text: dish.name }),
            h("span", { class: "muted small", text: `${fmtNumber(qty)} × ${fmtMoney(unitPrice)} ${unitPriceLabel(dish)}` })),
          h("div", { class: "qty-stepper" },
            h("button", { class: "btn btn-secondary btn-icon", type: "button", "data-key": `m-${dish.id}`, "aria-label": `הפחתת כמות: ${dish.name}`,
              onclick: () => setQty(dish.id, Math.max(0, +(qty - step).toFixed(2))) }, icon(qty - step <= 0 ? "trash" : "minus")),
            h("span", { class: "qty-value", text: qtyLabel(dish, qty) }),
            h("button", { class: "btn btn-secondary btn-icon", type: "button", "data-key": `p-${dish.id}`, "aria-label": `הוספת כמות: ${dish.name}`,
              onclick: () => setQty(dish.id, +(qty + step).toFixed(2)) }, icon("plus"))),
          h("strong", { class: "num line-total", text: fmtMoney(lineTotal) }));
      })));
    }

    const delivery = pricing.deliveryFee;
    fill(totalsBox, 
      totalRow("סכום ביניים", fmtMoney(pricing.subtotal)),
      state.order.event.fulfillment === "delivery"
        ? totalRow(`דמי משלוח (${state.order.event.city})`, delivery == null ? "ייקבע לפי העיר" : fmtMoney(delivery))
        : totalRow("איסוף עצמי", fmtMoney(0)),
      h("div", { class: "total-row grand", "aria-live": "polite" }, h("span", { text: "סה״כ" }), animatedAmount(pricing.total, lastTotal, fmtMoney)),
    );
    if (lastTotal !== null && lastTotal !== pricing.total) announce(`הסכום הכולל ${fmtMoney(pricing.total)}`);
    lastTotal = pricing.total;

    if (focusKey) {
      (linesBox.querySelector(`[data-key="${focusKey}"]`) ?? linesBox.querySelector(".qty-stepper button"))?.focus();
    }
  }

  function renderHints(state) {
    const missing = state.order.items && Object.keys(state.order.items).length ? missingCategories(state.order) : [];
    fill(hintsBox, 
      missing.length
        ? h("section", { class: "panel stack hints", "aria-labelledby": "hints-title" },
          h("h2", { id: "hints-title", class: "h3", text: "אולי שכחתם משהו?" }),
          h("p", { class: "muted", text: "עדיין אין בהזמנה מנות מהקטגוריות האלה:" }),
          h("div", { class: "chip-row" }, missing.map((c) => h("button", { class: "chip", type: "button", onclick: () => goto("menu") }, c.name))))
        : null,
    );
  }

  renderRecap(getState());
  renderLines(getState());
  renderHints(getState());
  lastItems = getState().order.items;

  const unsubscribe = subscribe((state) => {
    if (state.step !== "summary") return;
    if (state.order.items !== lastItems) {
      lastItems = state.order.items;
      renderLines(state);
      renderHints(state);
    }
  });
  return unsubscribe;
}

function unitPriceLabel(dish) {
  return dish.unit === "guest" ? "לאורח" : `ל${UNIT_LABELS[dish.unit]}`;
}

function totalRow(label, value) {
  return h("div", { class: "total-row" }, h("span", { text: label }), h("span", { class: "num", text: value }));
}
