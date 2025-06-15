document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('mainContainer');
    const signInButton = document.getElementById('signIn');
    const signUpButton = document.getElementById('signUp');

    if (signInButton && signUpButton && mainContainer) {
        signInButton.addEventListener('click', () => {
            mainContainer.classList.remove("right-panel-active");
        });

        signUpButton.addEventListener('click', () => {
            mainContainer.classList.add("right-panel-active");
        });
    } else {
        console.warn("Elementos signInButton, signUpButton ou mainContainer não encontrados. Funções de painel desabilitadas.");
    }

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    const regUsernameInput = document.getElementById('regUsername');
    const regEmailInput = document.getElementById('regEmail');
    const regPasswordInput = document.getElementById('regPassword');
    const registerMessage = document.getElementById('registerMessage');

    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginMessage = document.getElementById('loginMessage');

    // NOVOS ELEMENTOS PARA RECUPERAÇÃO DE SENHA
    const forgotPasswordLink = document.querySelector('#loginForm a[href="#"]');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotPasswordModalBtn = document.querySelector('.close-button-forgot-password');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const forgotEmailInput = document.getElementById('forgotEmail');
    const forgotPasswordMessage = document.getElementById('forgotPasswordMessage');

    const resetPasswordModal = document.getElementById('resetPasswordModal');
    const closeResetPasswordModalBtn = document.querySelector('.close-button-reset-password');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const resetTokenInput = document.getElementById('resetToken');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const resetPasswordMessage = document.getElementById('resetPasswordMessage');


    // Função para exibir mensagem
    function showMessage(element, msg, type) {
        element.textContent = msg;
        element.className = `message show ${type}`;
        setTimeout(() => {
            element.classList.remove('show');
            element.textContent = '';
        }, 5000);
    }

    // Lógica de Registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = regUsernameInput.value;
            const email = regEmailInput.value;
            const password = regPasswordInput.value;

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
                    showMessage(registerMessage, data.message, 'success');
                    registerForm.reset();
                    mainContainer.classList.remove("right-panel-active"); // Volta para login após registro
                } else {
                    showMessage(registerMessage, data.message || 'Erro no registro.', 'error');
                }
            } catch (error) {
                console.error('Erro de conexão ao registrar:', error);
                showMessage(registerMessage, 'Erro de conexão com o servidor.', 'error');
            }
        });
    }

    // Lógica de Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginEmailInput.value;
            const password = loginPasswordInput.value;

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
                    window.location.href = 'index.html'; // Redireciona para a aplicação principal
                } else {
                    showMessage(loginMessage, data.message || 'Credenciais inválidas.', 'error');
                }
            } catch (error) {
                console.error('Erro de conexão ao fazer login:', error);
                showMessage(loginMessage, 'Erro de conexão com o servidor.', 'error');
            }
        });
    }

    // Lógica para o Modal "Esqueceu a Senha"
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordModal.classList.add('is-visible');
            forgotPasswordForm.reset();
            forgotPasswordMessage.textContent = ''; // Limpa mensagens anteriores
            forgotPasswordMessage.classList.remove('show', 'success', 'error');
        });
    }

    if (closeForgotPasswordModalBtn) {
        closeForgotPasswordModalBtn.addEventListener('click', () => {
            forgotPasswordModal.classList.remove('is-visible');
        });
    }

    // Fechar modals clicando fora
    window.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.classList.remove('is-visible');
        }
        if (e.target === resetPasswordModal) {
            resetPasswordModal.classList.remove('is-visible');
        }
    });

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = forgotEmailInput.value;

            try {
                const response = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                if (response.ok) {
                    showMessage(forgotPasswordMessage, data.message, 'success');
                    forgotPasswordForm.reset();
                } else {
                    showMessage(forgotPasswordMessage, data.message || 'Erro ao enviar e-mail de redefinição.', 'error');
                }
            } catch (error) {
                console.error('Erro ao solicitar redefinição de senha:', error);
                showMessage(forgotPasswordMessage, 'Erro de conexão com o servidor.', 'error');
            }
        });
    }

    // Lógica para o Modal "Redefinir Senha"
    if (closeResetPasswordModalBtn) {
        closeResetPasswordModalBtn.addEventListener('click', () => {
            resetPasswordModal.classList.remove('is-visible');
        });
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = resetTokenInput.value;
            const newPassword = newPasswordInput.value;
            const confirmNewPassword = confirmNewPasswordInput.value;

            if (newPassword !== confirmNewPassword) {
                showMessage(resetPasswordMessage, 'As senhas não coincidem.', 'error');
                return;
            }

            try {
                const response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, newPassword })
                });

                const data = await response.json();
                if (response.ok) {
                    showMessage(resetPasswordMessage, data.message, 'success');
                    resetPasswordForm.reset();
                    setTimeout(() => {
                        resetPasswordModal.classList.remove('is-visible');
                    }, 3000);
                } else {
                    showMessage(resetPasswordMessage, data.message || 'Erro ao redefinir senha.', 'error');
                }
            } catch (error) {
                console.error('Erro ao redefinir senha:', error);
                showMessage(resetPasswordMessage, 'Erro de conexão com o servidor.', 'error');
            }
        });
    }

    // Lógica para verificar o token na URL e abrir o modal de redefinição
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        resetTokenInput.value = token;
        resetPasswordModal.classList.add('is-visible');
        history.replaceState({}, document.title, window.location.pathname); // Limpa o token da URL
    }
});