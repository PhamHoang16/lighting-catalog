import { createClient } from "@supabase/supabase-js";

/**
 * Static client for fetching public data during ISR/SSG.
 * This client does NOT use cookies or session, ensuring Next.js 
 * can pre-render pages as static content.
 */
export const createStaticClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};
