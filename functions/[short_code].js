import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req, res) => {
    // In Vercel/Netlify functions, dynamic segments are usually accessed via req.query
    const shortCode = req.query.short_code;

    if (!shortCode) {
        return res.status(400).send('Short code not provided.');
    }

    try {
        const { data, error } = await supabase
            .from('shortlinks') // <<< PASTIKAN NAMA TABEL ANDA SESUAI DI SINI
            .select('long_url, click_count')
            .eq('short_code', shortCode)
            .single();

        if (error && error.code === 'PGRST116') { // Supabase code for "Row not found"
            return res.status(404).send('Short URL not found.');
        } else if (error) {
            console.error('Error fetching shortlink:', error.message);
            return res.status(500).send('Internal Server Error.');
        }

        if (!data || !data.long_url) {
            return res.status(404).send('Short URL not found or invalid.');
        }

        const { long_url, click_count } = data;

        // Asynchronously update click_count without delaying the redirect
        supabase
            .from('shortlinks') // <<< PASTIKAN NAMA TABEL ANDA SESUAI DI SINI
            .update({ click_count: (click_count || 0) + 1 })
            .eq('short_code', shortCode)
            .then(({ error: updateError }) => {
                if (updateError) {
                    console.error('Error updating click count:', updateError.message);
                }
            });

        // Perform the redirect
        res.setHeader('Location', long_url);
        return res.status(302).send(null); // 302 Found for temporary redirect
    } catch (err) {
        console.error('Unhandled error in shortcode redirect:', err);
        res.status(500).send('An unexpected error occurred during redirection.');
    }
};
