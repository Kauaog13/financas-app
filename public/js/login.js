document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                loginMessage.textContent = 'Login bem-sucedido! Redirecionando...';
                loginMessage.classList.add('success');
                loginMessage.classList.remove('error');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                loginMessage.textContent = data.message || 'Credenciais inválidas.';
                loginMessage.classList.add('error');
                loginMessage.classList.remove('success');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            loginMessage.textContent = 'Erro ao comunicar com o servidor.';
            loginMessage.classList.add('error');
            loginMessage.classList.remove('success');
        }
    });
});