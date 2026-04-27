import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface CacheRow {
  cache_key: string;
  data: unknown;
  created_at: string;
  expires_at: string;
}

export async function getCached<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from("cache")
    .select("data, expires_at")
    .eq("cache_key", key)
    .single();

  if (error || !data) return null;

  if (new Date(data.expires_at) < new Date()) {
    await supabase.from("cache").delete().eq("cache_key", key);
    return null;
  }

  return data.data as T;
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds = 86400
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  await supabase.from("cache").upsert({
    cache_key: key,
    data: value,
    expires_at: expiresAt,
  });
}
