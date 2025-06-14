document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    // Carrega a preferência de modo escuro ao carregar a página
    loadDarkModePreference();

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        // Limpa e oculta mensagens anteriores
        registerMessage.textContent = '';
        registerMessage.className = 'message'; // Reseta classes
        registerMessage.classList.remove('show');

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
                registerMessage.classList.add('success', 'show');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                registerMessage.textContent = data.message || 'Erro ao registrar. Tente novamente.';
                registerMessage.classList.add('error', 'show');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            registerMessage.textContent = 'Erro ao comunicar com o servidor.';
            registerMessage.classList.add('error', 'show');
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