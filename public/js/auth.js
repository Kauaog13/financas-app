document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos HTML do Slider ---
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const mainContainer = document.getElementById('mainContainer'); // Renomeado de 'container' para evitar conflito

    // --- Elementos dos Formulários de Registro ---
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    // --- Elementos dos Formulários de Login ---
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    // --- Funções de Lógica do Slider ---
    signUpButton.addEventListener('click', () => {
        mainContainer.classList.add("right-panel-active");
        // Opcional: Limpar mensagens de erro ao alternar
        loginMessage.textContent = '';
        loginMessage.className = 'message';
        loginMessage.classList.remove('show');
    });

    signInButton.addEventListener('click', () => {
        mainContainer.classList.remove("right-panel-active");
        // Opcional: Limpar mensagens de erro ao alternar
        registerMessage.textContent = '';
        registerMessage.className = 'message';
        registerMessage.classList.remove('show');
    });

    // --- Lógica de Carregamento do Modo Escuro (igual ao app.js) ---
    function loadDarkModePreference() {
        const darkModePreference = localStorage.getItem('darkMode');
        if (darkModePreference === 'enabled') {
            document.body.classList.add('dark-mode');
        }
    }

    // --- Lógica do Formulário de Registro (Adaptada) ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        registerMessage.textContent = '';
        registerMessage.className = 'message';
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
                registerMessage.textContent = 'Registro realizado com sucesso! Faça login agora.';
                registerMessage.classList.add('success', 'show');
                // Após o registro, pode-se automaticamente mudar para a tela de login
                setTimeout(() => {
                    mainContainer.classList.remove("right-panel-active"); // Volta para tela de login
                    loginForm.reset(); // Limpa o formulário de login
                }, 2000);
            } else {
                registerMessage.textContent = data.message || 'Erro ao registrar. Tente novamente.';
                registerMessage.classList.add('error', 'show');
            }
        } catch (error) {
            console.error('Erro na requisição de registro:', error);
            registerMessage.textContent = 'Erro ao comunicar com o servidor.';
            registerMessage.classList.add('error', 'show');
        }
    });

    // --- Lógica do Formulário de Login (Adaptada) ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        loginMessage.textContent = '';
        loginMessage.className = 'message';
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
            console.error('Erro na requisição de login:', error);
            loginMessage.textContent = 'Erro ao comunicar com o servidor.';
            loginMessage.classList.add('error', 'show');
        }
    });

    // --- Inicialização ---
    loadDarkModePreference(); // Aplica o tema ao carregar a página
});