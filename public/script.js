document.addEventListener('DOMContentLoaded', () => {
    const longUrlInput = document.getElementById('longUrlInput');
    const shortenButton = document.getElementById('shortenButton');
    const resultDiv = document.getElementById('result');
    const shortUrlOutput = document.getElementById('shortUrlOutput');
    const copyButton = document.getElementById('copyButton');
    const errorMessage = document.getElementById('errorMessage');

    shortenButton.addEventListener('click', async () => {
        const longUrl = longUrlInput.value.trim();
        if (!longUrl) {
            showError('URL panjang tidak boleh kosong.');
            return;
        }

        // Basic URL validation
        try {
            new URL(longUrl);
        } catch (e) {
            showError('Format URL tidak valid. Pastikan diawali dengan http:// atau https://');
            return;
        }

        hideError();
        shortenButton.disabled = true;
        shortenButton.textContent = 'Memproses...';

        try {
            // Panggil Cloudflare Function Anda
            // Perhatikan bahwa ini akan dipanggil di path /api/create-link
            const response = await fetch('/api/create-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ longUrl: longUrl })
            });

            const data = await response.json();

            if (response.ok) {
                const shortCode = data.shortCode;
                // Asumsikan base URL shortlink adalah domain Anda sendiri
                // Cloudflare Pages akan mengalihkan permintaan ke fungsi Anda
                const currentDomain = window.location.origin;
                const fullShortUrl = `${currentDomain}/${shortCode}`; // URL pendek yang akan ditampilkan

                shortUrlOutput.href = fullShortUrl;
                shortUrlOutput.textContent = fullShortUrl;
                resultDiv.classList.remove('hidden');
            } else {
                showError(data.error || 'Terjadi kesalahan saat mempersingkat URL.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showError('Terjadi kesalahan jaringan atau server.');
        } finally {
            shortenButton.disabled = false;
            shortenButton.textContent = 'Persingkat URL';
        }
    });

    copyButton.addEventListener('click', () => {
        const textToCopy = shortUrlOutput.textContent;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyButton.textContent = 'Tersalin!';
                setTimeout(() => {
                    copyButton.textContent = 'Salin';
                }, 2000);
            })
            .catch(err => {
                console.error('Gagal menyalin: ', err);
                alert('Gagal menyalin URL.');
            });
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        resultDiv.classList.add('hidden'); // Sembunyikan hasil jika ada error
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
});
