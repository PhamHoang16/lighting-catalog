import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                // Disable HTTP cache for all admin/browser fetches.
                // Admin must always read fresh data to avoid stale-read bugs after mutations.
                fetch: (url, options = {}) =>
                    fetch(url, { ...options, cache: "no-store" }),
            },
        }
    );
}
