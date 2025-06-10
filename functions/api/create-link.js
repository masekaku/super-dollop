import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function generateShortCode() {
    // Generates a random 6-character alphanumeric string
    return Math.random().toString(36).substring(2, 8);
}

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { longUrl } = req.body;

    if (!longUrl) {
        return res.status(400).json({ message: 'Long URL is required' });
    }

    let shortCode;
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    // Loop to ensure the generated short_code is unique
    while (!isUnique && attempts < MAX_ATTEMPTS) {
        shortCode = generateShortCode();
        const { data, error } = await supabase
            .from('shortlinks') // <<< PASTIKAN NAMA TABEL ANDA SESUAI DI SINI
            .select('id')
            .eq('short_code', shortCode);

        if (error) {
            console.error('Error checking short code uniqueness:', error.message);
            return res.status(500).json({ message: 'Internal Server Error during uniqueness check' });
        }

        if (data && data.length === 0) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        return res.status(500).json({ message: 'Failed to generate unique short code after multiple attempts. Please try again.' });
    }

    try {
        const { data, error } = await supabase
            .from('shortlinks') // <<< PASTIKAN NAMA TABEL ANDA SESUAI DI SINI
            .insert([{ short_code: shortCode, long_url: longUrl }])
            .select(); // Returns the inserted data

        if (error) {
            console.error('Error inserting shortlink:', error.message);
            return res.status(500).json({ message: 'Internal Server Error while creating shortlink' });
        }

        // The host header will be the domain where your serverless function is deployed (e.g., your-app.vercel.app)
        const fullShortUrl = `${req.headers.host}/${shortCode}`;

        res.status(200).json({ shortUrl: fullShortUrl });
    } catch (err) {
        console.error('Unhandled error in create-link:', err);
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
};
