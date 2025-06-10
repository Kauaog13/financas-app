document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                registerMessage.textContent = 'Registro realizado com sucesso! Redirecionando para o login...';
                registerMessage.classList.add('success');
                registerMessage.classList.remove('error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                registerMessage.textContent = data.message || 'Erro ao registrar. Tente novamente.';
                registerMessage.classList.add('error');
                registerMessage.classList.remove('success');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            registerMessage.textContent = 'Erro ao comunicar com o servidor.';
            registerMessage.classList.add('error');
            registerMessage.classList.remove('success');
        }
    });
});