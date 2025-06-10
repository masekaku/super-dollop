document.addEventListener('DOMContentLoaded', () => {
    const longUrlInput = document.getElementById('longUrlInput');
    const createLinkBtn = document.getElementById('createLinkBtn');
    const resultDiv = document.getElementById('result');
    const shortLinkOutput = document.getElementById('shortLinkOutput');
    const copyBtn = document.getElementById('copyBtn');
    const messageDiv = document.getElementById('message');

    function showMessage(text, type = 'info') {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    createLinkBtn.addEventListener('click', async () => {
        const longUrl = longUrlInput.value.trim();

        if (!longUrl) {
            showMessage('Mohon masukkan URL yang valid.', 'error');
            return;
        }

        try {
            new URL(longUrl); // Simple URL validation
        } catch (e) {
            showMessage('URL yang dimasukkan tidak valid.', 'error');
            return;
        }

        showMessage('Membuat shortlink...', 'info');
        createLinkBtn.disabled = true;

        try {
            // Adjust the endpoint path if your deployment platform changes it
            const response = await fetch('/api/create-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ longUrl }),
            });

            const data = await response.json();

            if (response.ok) {
                // Ensure the displayed URL includes the full protocol and domain
                const fullShortUrl = `https://${data.shortUrl}`;
                shortLinkOutput.href = fullShortUrl;
                shortLinkOutput.textContent = fullShortUrl;
                resultDiv.classList.remove('hidden');
                showMessage('Shortlink berhasil dibuat!', 'success');
                longUrlInput.value = ''; // Clear input after successful creation
            } else {
                showMessage(`Gagal membuat shortlink: ${data.message || 'Terjadi kesalahan.'}`, 'error');
                resultDiv.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Terjadi kesalahan jaringan atau server. Coba lagi nanti.', 'error');
            resultDiv.classList.add('hidden');
        } finally {
            createLinkBtn.disabled = false;
        }
    });

    copyBtn.addEventListener('click', () => {
        const textToCopy = shortLinkOutput.textContent;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showMessage('Shortlink berhasil disalin!', 'success');
            })
            .catch(err => {
                console.error('Gagal menyalin:', err);
                showMessage('Gagal menyalin shortlink.', 'error');
            });
    });
});
