// functions/[short_code].js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export async function onRequestGet({ params }) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return new Response('Supabase credentials are not set.', { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const shortCode = params.short_code; // Mengambil short_code dari URL dinamis

    if (!shortCode) {
        return new Response('Short code not found.', { status: 400 });
    }

    try {
        // Query database Supabase untuk mencari URL panjang
        const { data, error } = await supabase
            .from('short_links')
            .select('long_url, click_count') // Ambil juga click_count jika ada
            .eq('short_code', shortCode)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
            console.error('Supabase query error:', error);
            return new Response('Database error.', { status: 500 });
        }

        if (!data) {
            // Short code tidak ditemukan, alihkan ke halaman 404
            // Atau ke halaman default Anda
            return Response.redirect('https://[YOUR_PAGES_DOMAIN]/404.html', 302); // Ganti dengan domain Anda
        }

        // (Opsional) Tingkatkan click_count
        await supabase
            .from('short_links')
            .update({ click_count: (data.click_count || 0) + 1 })
            .eq('short_code', shortCode);
        // Perhatikan: Incrementing click_count ini adalah operasi async terpisah
        // Tidak perlu menunggu ini selesai sebelum redirect

        // Lakukan pengalihan 301 (Moved Permanently)
        return Response.redirect(data.long_url, 301);

    } catch (e) {
        console.error('Error in [short_code].js:', e);
        return new Response('Internal server error.', { status: 500 });
    }
}
