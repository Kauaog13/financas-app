document.addEventListener('DOMContentLoaded', async () => {
    const userList = document.getElementById('userList');
    const logoutBtn = document.getElementById('logoutBtn');
    const backToAppBtn = document.getElementById('backToAppBtn');

    async function checkAdminAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login'; // Redireciona para a rota /login
            return;
        }
        try {
            const response = await fetch('/api/auth/verify', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                localStorage.removeItem('token');
                window.location.href = '/login'; // Redireciona para a rota /login
                return;
            }
            const userData = await response.json();
            if (userData.user.role !== 'admin') {
                alert('Acesso negado. Você não é um administrador.');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Erro ao verificar token de admin:', error);
            localStorage.removeItem('token');
            window.location.href = '/login'; // Redireciona para a rota /login
        }
    }

    async function fetchUsers() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const users = await response.json();
                renderUsers(users);
            } else {
                const errorData = await response.json();
                alert(`Erro ao buscar usuários: ${errorData.message || response.statusText}`);
                if (response.status === 403) {
                    window.location.href = 'index.html';
                }
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            alert('Erro ao comunicar com o servidor.');
        }
    }

    function renderUsers(users) {
        userList.innerHTML = '';
        if (users.length === 0) {
            userList.innerHTML = '<p style="text-align: center;">Nenhum usuário encontrado.</p>';
            return;
        }

        users.forEach(user => {
            const li = document.createElement('li');
            li.classList.add('user-item');
            li.innerHTML = `
                <div class="user-info">
                    <strong>${user.username}</strong>
                    <span>${user.email} - Papel: ${user.role}</span>
                </div>
                <div class="user-actions">
                    <button class="btn btn-primary btn-sm set-role-btn" data-id="${user.id}" data-role="user"><i class="fas fa-user"></i> Tornar Usuário</button>
                    <button class="btn btn-info btn-sm set-role-btn" data-id="${user.id}" data-role="admin"><i class="fas fa-user-shield"></i> Tornar Admin</button>
                    <button class="btn btn-danger btn-sm delete-user-btn" data-id="${user.id}"><i class="fas fa-trash-alt"></i> Excluir</button>
                </div>
            `;
            userList.appendChild(li);
        });
        addEventListenersToUserButtons();
    }

    function addEventListenersToUserButtons() {
        document.querySelectorAll('.set-role-btn').forEach(button => {
            button.onclick = async () => {
                const userId = parseInt(button.dataset.id);
                const newRole = button.dataset.role;
                await updateUserRole(userId, newRole);
            };
        });
        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.onclick = async () => {
                const userId = parseInt(button.dataset.id);
                await deleteUser(userId);
            };
        });
    }

    async function updateUserRole(userId, role) {
        const token = localStorage.getItem('token');
        if (confirm(`Tem certeza que deseja mudar o papel do usuário para ${role}?`)) {
            try {
                const response = await fetch(`/api/admin/users/${userId}/role`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    fetchUsers();
                } else {
                    alert(`Erro: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Erro ao atualizar papel:', error);
                alert('Erro ao comunicar com o servidor.');
            }
        }
    }

    async function deleteUser(userId) {
        const token = localStorage.getItem('token');
        if (confirm('Tem certeza que deseja excluir este usuário? Todas as transações dele serão excluídas.')) {
            try {
                const response = await fetch(`/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    fetchUsers();
                } else {
                    alert(`Erro: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Erro ao excluir usuário:', error);
                alert('Erro ao comunicar com o servidor.');
            }
        }
    }

    // Event Listeners
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    });

    backToAppBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Inicialização
    await checkAdminAuth();
    fetchUsers();
});