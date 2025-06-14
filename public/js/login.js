document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    // Carrega a preferência de modo escuro ao carregar a página
    loadDarkModePreference();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Limpa e oculta mensagens anteriores
        loginMessage.textContent = '';
        loginMessage.className = 'message'; // Reseta classes
        loginMessage.classList.remove('show');

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
                loginMessage.classList.add('success', 'show');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                loginMessage.textContent = data.message || 'Credenciais inválidas.';
                loginMessage.classList.add('error', 'show');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            loginMessage.textContent = 'Erro ao comunicar com o servidor.';
            loginMessage.classList.add('error', 'show');
        }
    });

    // Função para carregar a preferência de modo escuro (idêntica à do app.js)
    function loadDarkModePreference() {
        const darkModePreference = localStorage.getItem('darkMode');
        if (darkModePreference === 'enabled') {
            document.body.classList.add('dark-mode');
        }
        // Não há botão de toggle na página de login/registro, então não precisamos atualizar o ícone
    }
});