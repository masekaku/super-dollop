# Proyek Shortlink Saya

Aplikasi shortlink sederhana yang dibangun dengan Cloudflare Pages, Cloudflare Functions, dan Supabase.

## Fitur

- Membuat URL pendek dari URL panjang.
- Mengalihkan URL pendek ke URL aslinya.
- Pelacakan jumlah klik (opsional).

## Persiapan

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/YourUsername/nama-proyek-shortlink.git](https://github.com/YourUsername/nama-proyek-shortlink.git)
    cd nama-proyek-shortlink
    ```
2.  **Instal dependensi:**
    ```bash
    npm install
    ```
3.  **Siapkan Database Supabase:**
    * Buat proyek baru di [Supabase](https://supabase.com/).
    * Di "Table editor", buat tabel bernama `short_links` dengan kolom berikut:
        * `id` (uuid, Primary Key, Default: `gen_random_uuid()`)
        * `short_code` (text, Unique)
        * `long_url` (text, NOT NULL)
        * `created_at` (timestampz, Default: `now()`)
        * `click_count` (int8, Default: `0`)
    * Pastikan untuk mengatur **Row Level Security (RLS)** untuk tabel `short_links` agar Cloudflare Functions Anda dapat `SELECT` dan `INSERT` data. Contoh kebijakan sederhana:
        * Untuk `INSERT`: `(true)` (mengizinkan semua pengguna untuk insert, jika Anda tidak punya autentikasi pengguna)
        * Untuk `SELECT`: `(true)` (mengizinkan semua pengguna untuk select)
4.  **Atur Variabel Lingkungan:**
    * Di dashboard Cloudflare Pages Anda, buka proyek ini dan tambahkan variabel lingkungan berikut di bagian "Settings" -> "Environment variables":
        * `SUPABASE_URL`: URL API dari proyek Supabase Anda.
        * `SUPABASE_ANON_KEY`: Kunci `anon (public)` dari proyek Supabase Anda.
5.  **Deploy ke Cloudflare Pages:**
    * Hubungkan repositori Git Anda ke Cloudflare Pages.
    * Pastikan konfigurasi build:
        * **Build command:** `npm install`
        * **Build directory:** `public`

## Cara Menggunakan

1.  Akses URL Cloudflare Pages Anda (misalnya `https://your-shortlink-app.pages.dev/`).
2.  Masukkan URL panjang di kolom input dan klik "Persingkat URL".
3.  URL pendek akan muncul di bawahnya, siap untuk disalin dan dibagikan.

---

### Langkah Selanjutnya Setelah Membuat File-File Ini:

1.  **Buat Repositori Git:** Buat repositori baru di GitHub, GitLab, atau Bitbucket.
2.  **Unggah File:** Unggah semua file dan folder ini ke repositori Git Anda.
3.  **Konfigurasi Supabase:** Lakukan langkah "3. Konfigurasi Supabase (Database)" di atas untuk menyiapkan tabel dan RLS.
4.  **Deploy dengan Cloudflare Pages:** Ikuti langkah "7. Deployment ke Cloudflare Pages" di atas. Saat mengatur proyek baru di Cloudflare Pages, Anda akan menghubungkannya ke repositori Git ini dan menentukan variabel lingkungannya.

Dengan file-file ini, Anda memiliki dasar yang kuat untuk memulai proyek shortlink Anda. Semoga berhasil!
