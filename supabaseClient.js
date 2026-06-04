import { createClient } from "@supabase/supabase-js";

// Public, client-safe credentials. The publishable/anon key is designed to be
// exposed in front-end code; access control is enforced server-side via the
// SECURITY DEFINER RPC functions (see supabase-schema.sql), which require the
// account hash. There is no email/password auth — the hash is the credential.
const SUPABASE_URL = "https://uwmgisvhhzcbcisdlafp.supabase.co";
const SUPABASE_KEY = "sb_publishable_9B09KmOSMndFqdhDsHt6Kw_TRZd_jZ5";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
