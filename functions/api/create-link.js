// functions/api/create-link.js
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

// Ambil variabel lingkungan dari Cloudflare Pages
// Ini akan diset di pengaturan Pages Anda
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export async function onRequestPost({ request }) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return new Response(JSON.stringify({ error: 'Supabase credentials are not set.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    try {
        const { longUrl } = await request.json();

        if (!longUrl || typeof longUrl !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid URL provided.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Basic URL validation to ensure it's a valid URL string
        try {
            new URL(longUrl);
        } catch (e) {
            return new Response(JSON.stringify({ error: 'URL format is invalid. Make sure it starts with http:// or https://' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let shortCode;
        let isUnique = false;
        let attempts = 0;
        const MAX_ATTEMPTS = 5;

        // Generate a unique short code
        while (!isUnique && attempts < MAX_ATTEMPTS) {
            shortCode = nanoid(7); // Generate a 7-character short code
            const { data, error } = await supabase
                .from('short_links')
                .select('short_code')
                .eq('short_code', shortCode)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found" - which is good!
                console.error('Supabase query error:', error);
                throw new Error('Database query failed.');
            }
            if (!data) { // If no data found, shortCode is unique
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            return new Response(JSON.stringify({ error: 'Could not generate a unique short code after several attempts. Please try again.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('short_links')
            .insert([{ short_code: shortCode, long_url: longUrl }])
            .select(); // Use .select() to return the inserted data

        if (error) {
            console.error('Supabase insert error:', error);
            return new Response(JSON.stringify({ error: 'Failed to save shortlink.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ shortCode }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e) {
        console.error('Error in create-link.js:', e);
        return new Response(JSON.stringify({ error: e.message || 'Internal server error.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
