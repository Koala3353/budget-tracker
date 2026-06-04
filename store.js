import { supabase } from "./supabaseClient.js";

const HASH_KEY = "budget.hash";

/** Generate a 128-bit random account hash (32 hex chars). Acts as the credential. */
export function genHash() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getStoredHash() {
  try {
    return localStorage.getItem(HASH_KEY);
  } catch {
    return null;
  }
}

export function storeHash(hash) {
  try {
    localStorage.setItem(HASH_KEY, hash);
  } catch {
    /* private mode */
  }
}

/** Load a user's budget blob by hash. Returns the JSON object or null if new. */
export async function loadBudget(hash) {
  const { data, error } = await supabase.rpc("get_budget", { p_hash: hash });
  if (error) throw error;
  return data || null;
}

/** Upsert the full budget blob for a hash. */
export async function saveBudget(hash, payload) {
  const { error } = await supabase.rpc("upsert_budget", { p_hash: hash, p_data: payload });
  if (error) throw error;
}
