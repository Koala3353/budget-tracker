import { SUPABASE_URL, SUPABASE_KEY } from "./supabaseClient.js";

const HASH_KEY = "budget.hash";
const CACHE_PREFIX = "budget.cache.";
const PENDING_PREFIX = "budget.pending.";
const RPC_URL = `${SUPABASE_URL}/rest/v1/rpc`;
// Keep the local cache well under the ~5 MB localStorage budget. Each char is a
// UTF-16 code unit, so ~2M chars ≈ 4 MB — that's tens of thousands of
// transactions, far more than anyone logs. If we ever approach it we trim the
// OLDEST transactions from the cache (the newest, unsynced ones are kept).
const MAX_CACHE_CHARS = 2_000_000;

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

/**
 * Call a Supabase SECURITY DEFINER RPC via PostgREST. Replaces the
 * @supabase/supabase-js client — we only need these two functions, so a bare
 * fetch keeps the bundle small and skips the auth/realtime/storage modules.
 */
async function rpc(fn, body) {
  const res = await fetch(`${RPC_URL}/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`rpc ${fn} failed (${res.status}) ${detail}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** Load a user's budget blob by hash. Returns the JSON object or null if new. */
export async function loadBudget(hash) {
  const data = await rpc("get_budget", { p_hash: hash });
  return data || null;
}

/** Upsert the full budget blob for a hash. */
export async function saveBudget(hash, payload) {
  await rpc("upsert_budget", { p_hash: hash, p_data: payload });
}

// ---------------------------------------------------------------------------
// Offline durability: a write-through localStorage cache + a "pending" flag.
// The cache lets the app open and show your data instantly and offline; the
// pending flag marks unsynced changes so they can be flushed when you reconnect.
// ---------------------------------------------------------------------------

/** Read the cached blob for a hash. Returns { blob, partial } or null. */
export function readCache(hash) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + hash);
    if (!raw) return null;
    const blob = JSON.parse(raw);
    return { blob, partial: !!blob._partial };
  } catch {
    return null;
  }
}

/**
 * Write the blob to the cache, trimming oldest transactions if it would blow
 * the quota. Returns "full" | "partial" | false.
 */
export function writeCache(hash, blob) {
  try {
    let payload = blob;
    let str = JSON.stringify(payload);
    if (str.length > MAX_CACHE_CHARS && Array.isArray(blob.transactions)) {
      const txs = [...blob.transactions].sort((a, b) => b.ts - a.ts); // newest first
      let keep = txs.length;
      while (str.length > MAX_CACHE_CHARS && keep > 50) {
        keep = Math.floor(keep * 0.8);
        payload = { ...blob, transactions: txs.slice(0, keep), _partial: true };
        str = JSON.stringify(payload);
      }
    }
    localStorage.setItem(CACHE_PREFIX + hash, str);
    return payload._partial ? "partial" : "full";
  } catch {
    // Quota exceeded or private mode — fall back to a hard-trimmed copy so the
    // most recent activity still survives a reload; give up quietly otherwise.
    try {
      const txs = Array.isArray(blob.transactions)
        ? [...blob.transactions].sort((a, b) => b.ts - a.ts).slice(0, 500)
        : [];
      localStorage.setItem(
        CACHE_PREFIX + hash,
        JSON.stringify({ ...blob, transactions: txs, _partial: true })
      );
      return "partial";
    } catch {
      try {
        localStorage.removeItem(CACHE_PREFIX + hash);
      } catch {
        /* ignore */
      }
      return false;
    }
  }
}

export function clearCache(hash) {
  try {
    localStorage.removeItem(CACHE_PREFIX + hash);
    localStorage.removeItem(PENDING_PREFIX + hash);
  } catch {
    /* ignore */
  }
}

export function setPending(hash, val) {
  try {
    if (val) localStorage.setItem(PENDING_PREFIX + hash, "1");
    else localStorage.removeItem(PENDING_PREFIX + hash);
  } catch {
    /* ignore */
  }
}

export function isPending(hash) {
  try {
    return localStorage.getItem(PENDING_PREFIX + hash) === "1";
  } catch {
    return false;
  }
}

/**
 * Reconcile two blobs without losing data: union transactions by id, and take
 * scalar fields (settings, categories, overrides) from whichever blob is newer.
 * Used when flushing offline edits in case the local cache was trimmed.
 */
export function mergeBlobs(remote, local) {
  if (!remote) return local;
  if (!local) return remote;
  const map = new Map();
  for (const t of remote.transactions || []) map.set(t.id, t);
  for (const t of local.transactions || []) map.set(t.id, t); // local wins on conflict
  const newer = (local.updatedAt || 0) >= (remote.updatedAt || 0) ? local : remote;
  const { _partial, ...clean } = newer;
  return { ...clean, transactions: [...map.values()].sort((a, b) => b.ts - a.ts) };
}
