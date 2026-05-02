import { createBrowserClient, createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// Fallback a anon key cuando no hay service role (demo / hackathon path).
// RLS está disabled en este sprint, así que anon puede leer/escribir igual.
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY

export function browserClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export async function serverClient() {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (entries) => {
        try {
          entries.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // ignore: setAll fails in server components, ok in route handlers
        }
      },
    },
  })
}

// Service-role client — bypasses RLS. SERVER ONLY.
// Auth is enforced at the NextAuth layer; we use service role for all writes.
export function adminClient() {
  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
