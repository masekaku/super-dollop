import { createClient } from '@supabase/supabase-js';

export const onRequest = async (context) => {
    const { request, env, params, waitUntil } = context; // Ambil request, env, params, dan waitUntil dari context

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const shortCode = params.short_code; // Cloudflare Pages Functions menyediakan dynamic path segments di context.params

    if (!shortCode) {
        return new Response('Short code not provided.', { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('shortlinks') // <<< PASTIKAN NAMA TABEL ANDA SESUAI
            .select('long_url, click_count')
            .eq('short_code', shortCode)
            .single();

        if (error && error.code === 'PGRST116') {
            return new Response('Short URL not found.', { status: 404 });
        } else if (error) {
            console.error('Error fetching shortlink:', error.message);
            return new Response('Internal Server Error.', { status: 500 });
        }

        if (!data || !data.long_url) {
            return new Response('Short URL not found or invalid.', { status: 404 });
        }

        const { long_url, click_count } = data;

        // Update click_count asynchronously using waitUntil
        waitUntil(
            supabase
                .from('shortlinks') // <<< PASTIKAN NAMA TABEL ANDA SESUAI
                .update({ click_count: (click_count || 0) + 1 })
                .eq('short_code', shortCode)
                .then(({ error: updateError }) => {
                    if (updateError) {
                        console.error('Error updating click count:', updateError.message);
                    }
                })
        );

        // Redirect
        return Response.redirect(long_url, 302);

    } catch (err) {
        console.error('Unhandled error in shortcode redirect:', err);
        return new Response('An unexpected error occurred during redirection.', { status: 500 });
    }
};
