document.addEventListener('DOMContentLoaded', async () => {
    // Declaração de elementos HTML - DEVE SER DENTRO DO DOMContentLoaded
    const logoutBtn = document.getElementById('logoutBtn');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    const transactionList = document.getElementById('transactionList');
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    const transactionFormModal = document.getElementById('transactionFormModal');
    const categoryManagementModal = document.getElementById('categoryManagementModal');
    const closeTransactionModalBtn = document.querySelector('#transactionFormModal .close-button');
    const closeCategoryModalBtn = document.querySelector('#categoryManagementModal .close-button');
    const transactionForm = document.getElementById('transactionForm');
    const categoryForm = document.getElementById('categoryForm');
    const categoryListElement = document.getElementById('categoryList');
    const transactionIdInput = document.getElementById('transactionId');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeInput = document.getElementById('type');
    const categorySelect = document.getElementById('category');
    const dateInput = document.getElementById('date');
    const totalIncomeElement = document.getElementById('totalIncome');
    const totalExpenseElement = document.getElementById('totalExpense');
    const currentBalanceElement = document.getElementById('currentBalance');
    const filterDescriptionInput = document.getElementById('filterDescription');
    const sortTypeSelect = document.getElementById('sortType');

    const categoryIdInput = document.getElementById('categoryId');
    const categoryNameInput = document.getElementById('categoryName');
    const categoryTypeInput = document.getElementById('categoryType');

    let transactions = [];
    let categories = [];

    // --- Funções de Autenticação e Inicialização ---
    async function checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
        } else {
            try {
                const response = await fetch('/api/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const userData = await response.json();
                    console.log("DEBUG: Dados do Usuário Verificados:", userData.user);
                    console.log("DEBUG: Papel do Usuário:", userData.user.role);

                    if (adminPanelBtn) {
                        if (userData.user.role === 'admin') {
                            adminPanelBtn.style.display = 'inline-block';
                            console.log("DEBUG: Botão Painel Admin DEVE ser visível.");
                        } else {
                            adminPanelBtn.style.display = 'none';
                            console.log("DEBUG: Botão Painel Admin DEVE estar oculto (usuário comum).");
                        }
                    } else {
                        console.warn("ADVERTÊNCIA: Elemento adminPanelBtn não encontrado no DOM. Verifique o ID no HTML.");
                    }
                } else {
                    console.error("DEBUG: Verificação de token falhou:", response.status, response.statusText);
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('DEBUG: Erro ao verificar token:', error);
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        }
    }

    // --- Funções de Categorias ---
    async function fetchCategories() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                categories = await response.json();
                populateCategorySelect();
                renderCategoryList();
            } else {
                console.error('Falha ao buscar categorias:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        }
    }

    function populateCategorySelect() {
        categorySelect.innerHTML = '<option value="">Selecione uma Categoria</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.name} (${category.type === 'income' ? 'Receita' : 'Despesa'})`;
            categorySelect.appendChild(option);
        });
    }

    function renderCategoryList() {
        categoryListElement.innerHTML = '';
        if (categories.length === 0) {
            categoryListElement.innerHTML = '<p style="text-align: center;">Nenhuma categoria cadastrada.</p>';
            return;
        }
        categories.forEach(category => {
            const li = document.createElement('li');
            li.classList.add('category-item');
            li.innerHTML = `
                <span class="category-name-display">${category.name}</span>
                <span class="category-type-display">(${category.type === 'income' ? 'Receita' : 'Despesa'})</span>
                <div class="category-actions">
                    <button class="btn btn-primary btn-sm edit-category-btn" data-id="${category.id}">Editar</button>
                    <button class="btn btn-danger btn-sm delete-category-btn" data-id="${category.id}">Excluir</button>
                </div>
            `;
            categoryListElement.appendChild(li);
        });
        addEventListenersToCategoryButtons();
    }

    async function addEditCategory() {
        const token = localStorage.getItem('token');
        const categoryId = categoryIdInput.value;
        const name = categoryNameInput.value;
        const type = categoryTypeInput.value;

        let url = '/api/categories';
        let method = 'POST';

        if (categoryId) {
            url = `/api/categories/${categoryId}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, type })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                categoryForm.reset();
                categoryIdInput.value = '';
                fetchCategories();
            } else {
                alert(`Erro: ${data.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Erro na requisição de categoria:', error);
            alert('Erro ao comunicar com o servidor.');
        }
    }

    async function deleteCategory(id) {
        const token = localStorage.getItem('token');
        if (confirm('Tem certeza que deseja excluir esta categoria? Transações associadas terão a categoria removida.')) {
            try {
                const response = await fetch(`/api/categories/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    fetchCategories();
                    fetchTransactions();
                } else {
                    alert(`Erro: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Erro ao excluir categoria:', error);
                alert('Erro ao comunicar com o servidor.');
            }
        }
    }

    function editCategory(id) {
        const category = categories.find(cat => cat.id === id);
        if (category) {
            categoryIdInput.value = category.id;
            categoryNameInput.value = category.name;
            categoryTypeInput.value = category.type;
        }
    }

    function addEventListenersToCategoryButtons() {
        document.querySelectorAll('.edit-category-btn').forEach(button => {
            button.onclick = () => editCategory(parseInt(button.dataset.id));
        });
        document.querySelectorAll('.delete-category-btn').forEach(button => {
            button.onclick = () => deleteCategory(parseInt(button.dataset.id));
        });
    }

    // --- Funções de Transações (com integração de Categorias) ---
    async function fetchTransactions() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/finance/transactions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                transactions = await response.json();
                renderTransactions();
                updateOverview();
            } else {
                console.error('Falha ao buscar transações:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
        }
    }

    function renderTransactions() {
        transactionList.innerHTML = '';
        let filteredTransactions = transactions.filter(transaction =>
            transaction.description.toLowerCase().includes(filterDescriptionInput.value.toLowerCase())
        );

        const sortValue = sortTypeSelect.value;
        filteredTransactions.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (sortValue === 'date-desc') {
                return dateB - dateA;
            } else if (sortValue === 'date-asc') {
                return dateA - dateB;
            } else if (sortValue === 'amount-desc') {
                return parseFloat(b.amount) - parseFloat(a.amount);
            } else if (sortValue === 'amount-asc') {
                return parseFloat(a.amount) - parseFloat(b.amount);
            }
            return 0;
        });

        if (filteredTransactions.length === 0) {
            transactionList.innerHTML = '<p style="text-align: center;">Nenhuma transação encontrada.</p>';
            return;
        }

        filteredTransactions.forEach(transaction => {
            const li = document.createElement('li');
            li.classList.add('transaction-item', transaction.type);
            li.innerHTML = `
                <span class="description">${transaction.description}</span>
                <span class="category-name">${transaction.category_name ? `(${transaction.category_name})` : '(Sem Categoria)'}</span>
                <span class="amount">${transaction.type === 'income' ? '+' : '-'} R$ ${parseFloat(transaction.amount).toFixed(2).replace('.', ',')}</span>
                <span class="date">${new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                <div class="transaction-actions">
                    <button class="btn btn-primary edit-btn" data-id="${transaction.id}">Editar</button>
                    <button class="btn btn-danger delete-btn" data-id="${transaction.id}">Excluir</button>
                </div>
            `;
            transactionList.appendChild(li);
        });

        // Corrigido: Garante que os listeners são adicionados APÓS a renderização
        addEventListenersToTransactionButtons();
    }

    function updateOverview() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const currentBalance = totalIncome - totalExpense;

        totalIncomeElement.textContent = `R$ ${totalIncome.toFixed(2).replace('.', ',')}`;
        totalExpenseElement.textContent = `R$ ${totalExpense.toFixed(2).replace('.', ',')}`;
        currentBalanceElement.textContent = `R$ ${currentBalance.toFixed(2).replace('.', ',')}`;
    }

    // Event Listener para o formulário de Transação
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const transactionId = transactionIdInput.value;
        const description = descriptionInput.value;
        const amount = parseFloat(amountInput.value);
        const type = typeInput.value;
        const category_id = categorySelect.value ? parseInt(categorySelect.value) : null;
        const date = dateInput.value;

        const transactionData = { description, amount, type, date, category_id };
        console.log("DEBUG: Dados da Transação a serem enviados:", transactionData);

        let url = '/api/finance/transactions';
        let method = 'POST';

        if (transactionId) {
            url = `/api/finance/transactions/${transactionId}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transactionData)
            });

            if (response.ok) {
                alert('Transação salva com sucesso!');
                transactionFormModal.style.display = 'none';
                transactionForm.reset();
                fetchTransactions();
            } else {
                const errorData = await response.json();
                alert(`Erro ao salvar transação: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro ao comunicar com o servidor.');
        }
    });

    // Event Listener para o formulário de Categoria
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addEditCategory();
    });

    // Preencher formulário de transação para edição
    async function editTransaction(id) {
        const transaction = transactions.find(t => t.id === id);
        if (transaction) {
            transactionIdInput.value = transaction.id;
            descriptionInput.value = transaction.description;
            amountInput.value = parseFloat(transaction.amount);
            typeInput.value = transaction.type;
            dateInput.value = new Date(transaction.date).toISOString().split('T')[0];

            await populateCategorySelect();
            if (transaction.category_id) {
                categorySelect.value = transaction.category_id;
            } else {
                categorySelect.value = '';
            }

            transactionFormModal.style.display = 'flex';
        }
    }

    // Função de Excluir Transação - Corrigida e com logs de depuração
    async function deleteTransaction(id) {
        const token = localStorage.getItem('token');
        console.log("DEBUG: Tentando deletar transação com ID:", id); // Log para ver o ID
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            try {
                const response = await fetch(`/api/finance/transactions/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    alert('Transação excluída com sucesso!');
                    fetchTransactions(); // Recarrega a lista após exclusão
                } else {
                    const errorData = await response.json();
                    alert(`Erro ao excluir transação: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Erro na requisição DELETE:', error); // Log mais específico
                alert('Erro ao comunicar com o servidor ao excluir transação.');
            }
        }
    }

    // Adiciona Event Listeners para os botões de Editar e Excluir
    function addEventListenersToTransactionButtons() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.onclick = () => editTransaction(parseInt(button.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.onclick = () => deleteTransaction(parseInt(button.dataset.id));
        });
    }

    // --- Event Listeners dos Modais e Botões ---
    addTransactionBtn.onclick = async () => {
        transactionIdInput.value = '';
        transactionForm.reset();
        await populateCategorySelect();
        categorySelect.value = '';
        transactionFormModal.style.display = 'flex';
    };
    closeTransactionModalBtn.onclick = () => {
        transactionFormModal.style.display = 'none';
    };

    manageCategoriesBtn.onclick = async () => {
        categoryForm.reset();
        categoryIdInput.value = '';
        await fetchCategories();
        categoryManagementModal.style.display = 'flex';
    };
    closeCategoryModalBtn.onclick = () => {
        categoryManagementModal.style.display = 'none';
    };

    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }

    window.onclick = (event) => {
        if (event.target == transactionFormModal) {
            transactionFormModal.style.display = 'none';
        }
        if (event.target == categoryManagementModal) {
            categoryManagementModal.style.display = 'none';
        }
    };

    filterDescriptionInput.addEventListener('input', renderTransactions);
    sortTypeSelect.addEventListener('change', renderTransactions);
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    typeInput.addEventListener('change', populateCategorySelect);

    // --- Inicialização ---
    await checkAuth();
    await fetchCategories();
    fetchTransactions(); // Garante que as transações são carregadas ao iniciar
});