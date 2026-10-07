import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serverKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseConfig = Boolean(url || serverKey);
export const hasSupabase = Boolean(url && serverKey);

if (hasSupabaseConfig && !hasSupabase) {
  throw new Error("Supabase configuration is incomplete: set SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).");
}

export const supabase = hasSupabase
  ? createClient(url!, serverKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
