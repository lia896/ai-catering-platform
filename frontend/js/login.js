// Customer login by email magic link (Supabase Auth). The session is kept by supabase-js in localStorage.
import { supabase } from "./supabase.js";

const $ = (id) => document.getElementById(id);
const form = $("login-form");
const field = $("email-field");
const error = $("email-error");

// Where to go after signing in; same-site paths only, so the link can't send people elsewhere.
const wanted = new URLSearchParams(location.search).get("next") ?? "";
const next = /^\/(?!\/)/.test(wanted) ? wanted : null;

function show(session) {
  if (session && next) {
    location.replace(next);
    return;
  }
  form.hidden = Boolean(session) || !$("sent").hidden;
  $("signed-in").hidden = !session;
  if (session) {
    $("sent").hidden = true;
    $("user-email").textContent = session.user.email;
  }
}

function fail(message) {
  field.classList.add("invalid");
  error.textContent = message;
  error.hidden = false;
  $("email").focus();
}

let usePassword = false;
$("toggle-password").addEventListener("click", (e) => {
  usePassword = !usePassword;
  $("password-field").hidden = !usePassword;
  $("submit").textContent = usePassword ? "כניסה" : "שליחת קישור";
  e.currentTarget.textContent = usePassword ? "כניסה עם קישור במייל" : "כניסה עם סיסמה";
  e.currentTarget.setAttribute("aria-expanded", String(usePassword));
  if (usePassword) $("password").focus();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("email").value.trim();
  if (!$("email").checkValidity() || !email) return fail("צריך כתובת מייל תקינה.");
  field.classList.remove("invalid");
  error.hidden = true;

  const button = $("submit");
  button.disabled = true;
  if (usePassword) {
    // Password sign-in exists for the demo users; customers normally use the magic link.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: $("password").value });
    button.disabled = false;
    if (signInError) return fail("המייל או הסיסמה לא נכונים.");
    return;
  }
  const { error: sendError } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${location.origin}/login/${next ? `?next=${encodeURIComponent(next)}` : ""}` },
  });
  button.disabled = false;
  if (sendError) return fail("לא הצלחנו לשלוח את הקישור. כדאי לנסות שוב בעוד דקה.");

  $("sent-email").textContent = email;
  form.hidden = true;
  $("sent").hidden = false;
  $("announce").textContent = "הקישור נשלח למייל.";
});

$("sign-out").addEventListener("click", () => supabase.auth.signOut());

// Fires on load (including right after the magic-link redirect) and on sign-in/out.
supabase.auth.onAuthStateChange((_event, session) => show(session));
