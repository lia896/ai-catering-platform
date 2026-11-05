// Shared Supabase client for the browser: sign-in session, realtime and RLS-filtered reads.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
import { api } from "./api.js";

const { supabase_url: url, supabase_anon_key: key } = await api("/config/public");
export const supabase = createClient(url, key);

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Headers for backend calls that need the signed-in customer. */
export async function authHeaders() {
  const session = await getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}
