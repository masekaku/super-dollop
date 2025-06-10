import { createClient } from '@supabase/supabase-js';

// Cloudflare Pages Functions akan menyediakan `context`
// Variabel lingkungan diakses melalui `context.env`
// Untuk ini, Anda perlu mengubah export default async (req, res) => { ... }
// menjadi export const onRequest = async (context) => { ... }
// dan mengambil req, res dari context

// Fungsi utilitas untuk menghasilkan short code
function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
}

export const onRequest = async (context) => {
    const { request, env } = context; // Ambil request dan env dari context

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    let longUrl;
    try {
        const requestBody = await request.json();
        longUrl = requestBody.longUrl;
    } catch (e) {
        return new Response(JSON.stringify({ message: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!longUrl) {
        return new Response(JSON.stringify({ message: 'Long URL is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    let shortCode;
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (!isUnique && attempts < MAX_ATTEMPTS) {
        shortCode = generateShortCode();
        const { data, error } = await supabase
            .from('shortlinks') // <<< PASTIKAN NAMA TABEL ANDA SESUAI
            .select('id')
            .eq('short_code', shortCode);

        if (error) {
            console.error('Error checking short code uniqueness:', error.message);
            return new Response(JSON.stringify({ message: 'Internal Server Error during uniqueness check' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        if (data && data.length === 0) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        return new Response(JSON.stringify({ message: 'Failed to generate unique short code. Please try again.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { data, error } = await supabase
            .from('shortlinks') // <<< PASTIKAN NAMA TABEL ANDA SESUAI
            .insert([{ short_code: shortCode, long_url: longUrl }])
            .select();

        if (error) {
            console.error('Error inserting shortlink:', error.message);
            return new Response(JSON.stringify({ message: 'Internal Server Error while creating shortlink' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Dapatkan host dari request untuk membuat URL penuh
        const fullShortUrl = `${request.headers.get('host')}/${shortCode}`;

        return new Response(JSON.stringify({ shortUrl: fullShortUrl }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (err) {
        console.error('Unhandled error in create-link:', err);
        return new Response(JSON.stringify({ message: 'An unexpected error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
