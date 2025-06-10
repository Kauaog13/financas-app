document.addEventListener('DOMContentLoaded', async () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const transactionList = document.getElementById('transactionList');
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const transactionFormModal = document.getElementById('transactionFormModal');
    const closeButton = document.querySelector('.modal .close-button');
    const transactionForm = document.getElementById('transactionForm');
    const transactionIdInput = document.getElementById('transactionId');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeInput = document.getElementById('type');
    const dateInput = document.getElementById('date');
    const totalIncomeElement = document.getElementById('totalIncome');
    const totalExpenseElement = document.getElementById('totalExpense');
    const currentBalanceElement = document.getElementById('currentBalance');
    const filterDescriptionInput = document.getElementById('filterDescription');
    const sortTypeSelect = document.getElementById('sortType');

    let transactions = [];

    // Função para verificar autenticação
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
                if (!response.ok) {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('Erro ao verificar token:', error);
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        }
    }

    // Função para buscar transações
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
                console.log("Transações recebidas:", transactions); // Debug: ver transações
                renderTransactions();
                updateOverview();
            } else {
                console.error('Falha ao buscar transações:', response.statusText);
                // Tratar erro, talvez redirecionar para login se for erro de autenticação
            }
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
        }
    }

    // Função para renderizar transações
    function renderTransactions() {
        transactionList.innerHTML = '';
        let filteredTransactions = transactions.filter(transaction =>
            transaction.description.toLowerCase().includes(filterDescriptionInput.value.toLowerCase())
        );

        const sortValue = sortTypeSelect.value;
        filteredTransactions.sort((a, b) => {
            // Garante que a comparação de data funcione, mesmo se for string
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (sortValue === 'date-desc') {
                return dateB - dateA;
            } else if (sortValue === 'date-asc') {
                return dateA - dateB;
            } else if (sortValue === 'amount-desc') {
                return parseFloat(b.amount) - parseFloat(a.amount); // CORREÇÃO AQUI
            } else if (sortValue === 'amount-asc') {
                return parseFloat(a.amount) - parseFloat(b.amount); // CORREÇÃO AQUI
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
                <span class="amount">${transaction.type === 'income' ? '+' : '-'} R$ ${parseFloat(transaction.amount).toFixed(2).replace('.', ',')}</span>
                <span class="date">${new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                <div class="transaction-actions">
                    <button class="btn btn-primary edit-btn" data-id="${transaction.id}">Editar</button>
                    <button class="btn btn-danger delete-btn" data-id="${transaction.id}">Excluir</button>
                </div>
            `;
            transactionList.appendChild(li);
        });

        addEventListenersToTransactionButtons();
    }

    // Função para atualizar o resumo
    function updateOverview() {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0); // CORREÇÃO AQUI
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0); // CORREÇÃO AQUI
        const currentBalance = totalIncome - totalExpense;

        console.log("DEBUG: Total Receitas:", totalIncome);
        console.log("DEBUG: Total Despesas:", totalExpense);
        console.log("DEBUG: Saldo Atual:", currentBalance);

        totalIncomeElement.textContent = `R$ ${totalIncome.toFixed(2).replace('.', ',')}`;
        totalExpenseElement.textContent = `R$ ${totalExpense.toFixed(2).replace('.', ',')}`;
        currentBalanceElement.textContent = `R$ ${currentBalance.toFixed(2).replace('.', ',')}`;
    }

    // Adicionar/Editar Transação
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const transactionId = transactionIdInput.value;
        const description = descriptionInput.value;
        const amount = parseFloat(amountInput.value); // Já é float aqui do input type="number"
        const type = typeInput.value;
        const date = dateInput.value;

        const transactionData = { description, amount, type, date };
        let url = '/api/finance/transactions';
        let method = 'POST';

        if (transactionId) { // Edição
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

    // Excluir Transação
    async function deleteTransaction(id) {
        const token = localStorage.getItem('token');
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
                    fetchTransactions();
                } else {
                    const errorData = await response.json();
                    alert(`Erro ao excluir transação: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Erro ao comunicar com o servidor.');
            }
        }
    }

    // Preencher formulário para edição
    async function editTransaction(id) {
        const transaction = transactions.find(t => t.id === id);
        if (transaction) {
            transactionIdInput.value = transaction.id;
            descriptionInput.value = transaction.description;
            amountInput.value = parseFloat(transaction.amount); // CORREÇÃO AQUI para preencher o input corretamente
            typeInput.value = transaction.type;
            dateInput.value = new Date(transaction.date).toISOString().split('T')[0]; // Formata para 'YYYY-MM-DD'
            transactionFormModal.style.display = 'flex'; // Exibe o modal
        }
    }

    function addEventListenersToTransactionButtons() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.onclick = () => editTransaction(parseInt(button.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.onclick = () => deleteTransaction(parseInt(button.dataset.id));
        });
    }

    // Event Listeners para o Modal
    addTransactionBtn.onclick = () => {
        transactionIdInput.value = ''; // Limpa o ID para nova transação
        transactionForm.reset(); // Limpa o formulário
        transactionFormModal.style.display = 'flex';
    };
    closeButton.onclick = () => {
        transactionFormModal.style.display = 'none';
    };
    window.onclick = (event) => {
        if (event.target == transactionFormModal) {
            transactionFormModal.style.display = 'none';
        }
    };

    filterDescriptionInput.addEventListener('input', renderTransactions);
    sortTypeSelect.addEventListener('change', renderTransactions);
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Inicialização
    await checkAuth();
    fetchTransactions();
});