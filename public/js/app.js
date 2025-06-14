document.addEventListener('DOMContentLoaded', async () => {
    // Declaração de elementos HTML
    const logoutBtn = document.getElementById('logoutBtn');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    const transactionList = document.getElementById('transactionList');
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    const exportTransactionsBtn = document.getElementById('exportTransactionsBtn');
    // NOVO: Elementos para Orçamentos
    const manageBudgetsBtn = document.getElementById('manageBudgetsBtn');
    const budgetOverviewList = document.getElementById('budgetOverviewList');
    const noBudgetsMessage = document.getElementById('noBudgetsMessage');

    const transactionFormModal = document.getElementById('transactionFormModal');
    const categoryManagementModal = document.getElementById('categoryManagementModal');
    const budgetManagementModal = document.getElementById('budgetManagementModal'); // NOVO: Modal de Orçamento

    const closeTransactionModalBtn = document.querySelector('#transactionFormModal .close-button');
    const closeCategoryModalBtn = document.querySelector('#categoryManagementModal .close-button');
    const closeBudgetModalBtn = document.querySelector('#budgetManagementModal .close-button'); // NOVO: Close button de Orçamento

    const transactionForm = document.getElementById('transactionForm');
    const categoryForm = document.getElementById('categoryForm');
    const budgetForm = document.getElementById('budgetForm'); // NOVO: Formulário de Orçamento

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

    // Elementos de filtro
    const filterTypeSelect = document.getElementById('filterType');
    const filterCategorySelect = document.getElementById('filterCategory');
    const filterStartDateInput = document.getElementById('filterStartDate');
    const filterEndDateInput = document.getElementById('filterEndDate');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    // Elementos para os gráficos
    const expensePieChartCanvas = document.getElementById('expensePieChart');
    const noExpenseDataMessage = document.getElementById('noExpenseDataMessage');
    const incomeBarChartCanvas = document.getElementById('incomeBarChart');
    const noIncomeDataMessage = document.getElementById('noIncomeDataMessage');


    const categoryIdInput = document.getElementById('categoryId');
    const categoryNameInput = document.getElementById('categoryName');
    const categoryTypeInput = document.getElementById('categoryType');

    // NOVO: Elementos do formulário de orçamento
    const budgetIdInput = document.getElementById('budgetId');
    const budgetCategorySelect = document.getElementById('budgetCategory');
    const budgetAmountLimitInput = document.getElementById('budgetAmountLimit');
    const budgetMonthSelect = document.getElementById('budgetMonth');
    const budgetYearInput = document.getElementById('budgetYear');
    const budgetListElement = document.getElementById('budgetList');


    let transactions = [];
    let categories = [];
    let budgets = []; // NOVO: Armazenará os orçamentos
    let expensePieChartInstance = null;
    let incomeBarChartInstance = null;

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
                populateFilterCategorySelect();
                populateBudgetCategorySelect(); // NOVO: Popular categorias no formulário de orçamento
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

    function populateFilterCategorySelect() {
        filterCategorySelect.innerHTML = '<option value="">Todas as Categorias</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.name} (${category.type === 'income' ? 'Receita' : 'Despesa'})`;
            filterCategorySelect.appendChild(option);
        });
    }

    // NOVO: Função para popular o select de categoria no formulário de orçamento (apenas despesas)
    function populateBudgetCategorySelect() {
        budgetCategorySelect.innerHTML = '<option value="">Selecione uma Categoria de Despesa</option>';
        const expenseCategories = categories.filter(cat => cat.type === 'expense');
        expenseCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            budgetCategorySelect.appendChild(option);
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
                fetchTransactions();
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

    // --- Funções de Orçamentos ---
    // Preenche o select de meses no formulário de orçamento
    function populateBudgetMonths() {
        budgetMonthSelect.innerHTML = '';
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        monthNames.forEach((name, index) => {
            const option = document.createElement('option');
            option.value = index + 1; // Mês 1-12
            option.textContent = name;
            budgetMonthSelect.appendChild(option);
        });
        // Seleciona o mês atual por padrão
        budgetMonthSelect.value = new Date().getMonth() + 1;
        budgetYearInput.value = new Date().getFullYear();
    }

    async function fetchBudgets() {
        const token = localStorage.getItem('token');
        // Filtra por mês e ano atuais para exibição na tela principal
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const url = `/api/budgets?month=${currentMonth}&year=${currentYear}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                budgets = await response.json();
                renderBudgetOverview();
                renderBudgetList(); // Para o modal de gerenciamento
            } else {
                console.error('Falha ao buscar orçamentos:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao buscar orçamentos:', error);
        }
    }

    function renderBudgetOverview() {
        budgetOverviewList.innerHTML = '';
        if (budgets.length === 0) {
            noBudgetsMessage.style.display = 'block';
            budgetOverviewList.style.display = 'none';
            return;
        }
        noBudgetsMessage.style.display = 'none';
        budgetOverviewList.style.display = 'grid'; // Grid display for current budgets

        budgets.forEach(budget => {
            const expensePercentage = (budget.current_expense / budget.amount_limit) * 100;
            let progressBarClass = '';
            if (expensePercentage >= 100) {
                progressBarClass = 'danger';
            } else if (expensePercentage >= 80) {
                progressBarClass = 'warning';
            }

            const li = document.createElement('div'); // Usamos div para o item de orçamento para melhor layout
            li.classList.add('budget-item');
            li.innerHTML = `
                <div class="budget-item-info">
                    <span class="category-name-display">${budget.category_name}</span>
                    <span class="budget-period">${budget.month}/${budget.year}</span>
                </div>
                <div class="budget-values">
                    <span>Gasto: R$ ${budget.current_expense.toFixed(2).replace('.', ',')}</span> /
                    <span>Limite: R$ ${budget.amount_limit.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="budget-progress-bar-container">
                    <div class="budget-progress-bar-fill ${progressBarClass}" style="width: ${Math.min(expensePercentage, 100)}%;"></div>
                </div>
            `;
            budgetOverviewList.appendChild(li);
        });
    }

    function renderBudgetList() {
        budgetListElement.innerHTML = ''; // Limpa a lista no modal
        if (budgets.length === 0) {
            budgetListElement.innerHTML = '<p style="text-align: center;">Nenhum orçamento definido.</p>';
            return;
        }

        budgets.forEach(budget => {
            const li = document.createElement('li');
            li.classList.add('budget-item-modal'); // Nova classe para itens do modal
            li.innerHTML = `
                <div class="budget-item-info">
                    <span class="category-name-display">${budget.category_name}</span>
                    <span class="budget-period">${budget.month}/${budget.year}</span>
                </div>
                <div class="budget-values">
                    <span>Limite: R$ ${budget.amount_limit.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="budget-actions">
                    <button class="btn btn-primary btn-sm edit-budget-btn" data-id="${budget.id}">Editar</button>
                    <button class="btn btn-danger btn-sm delete-budget-btn" data-id="${budget.id}">Excluir</button>
                </div>
            `;
            budgetListElement.appendChild(li);
        });
        addEventListenersToBudgetButtons();
    }

    function addEventListenersToBudgetButtons() {
        document.querySelectorAll('.edit-budget-btn').forEach(button => {
            button.onclick = () => editBudget(parseInt(button.dataset.id));
        });
        document.querySelectorAll('.delete-budget-btn').forEach(button => {
            button.onclick = () => deleteBudget(parseInt(button.dataset.id));
        });
    }

    async function addEditBudget() {
        const token = localStorage.getItem('token');
        const budgetId = budgetIdInput.value;
        const category_id = budgetCategorySelect.value;
        const amount_limit = parseFloat(budgetAmountLimitInput.value);
        const month = parseInt(budgetMonthSelect.value);
        const year = parseInt(budgetYearInput.value);

        if (!category_id || !amount_limit || !month || !year) {
            alert('Por favor, preencha todos os campos do orçamento.');
            return;
        }

        const budgetData = { category_id, amount_limit, month, year };
        let url = '/api/budgets';
        let method = 'POST';

        if (budgetId) {
            url = `/api/budgets/${budgetId}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(budgetData)
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                budgetForm.reset();
                budgetIdInput.value = '';
                fetchBudgets(); // Recarrega orçamentos
            } else {
                alert(`Erro: ${data.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Erro na requisição de orçamento:', error);
            alert('Erro ao comunicar com o servidor.');
        }
    }

    async function deleteBudget(id) {
        const token = localStorage.getItem('token');
        if (confirm('Tem certeza que deseja excluir este orçamento?')) {
            try {
                const response = await fetch(`/api/budgets/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    fetchBudgets(); // Recarrega orçamentos
                } else {
                    alert(`Erro: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Erro ao excluir orçamento:', error);
                alert('Erro ao comunicar com o servidor.');
            }
        }
    }

    function editBudget(id) {
        const budget = budgets.find(b => b.id === id);
        if (budget) {
            budgetIdInput.value = budget.id;
            budgetCategorySelect.value = budget.category_id;
            budgetAmountLimitInput.value = budget.amount_limit;
            budgetMonthSelect.value = budget.month;
            budgetYearInput.value = budget.year;
            budgetManagementModal.style.display = 'flex';
        }
    }

    // --- Funções de Transações (com integração de Filtros e Categorias) ---
    async function fetchTransactions() {
        const token = localStorage.getItem('token');

        const filters = {
            description: filterDescriptionInput.value,
            type: filterTypeSelect.value,
            categoryId: filterCategorySelect.value,
            startDate: filterStartDateInput.value,
            endDate: filterEndDateInput.value
        };

        const queryParams = new URLSearchParams();
        for (const key in filters) {
            if (filters[key]) {
                queryParams.append(key, filters[key]);
            }
        }
        const url = `/api/finance/transactions?${queryParams.toString()}`;
        console.log("DEBUG: URL de requisição de transações:", url);


        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                transactions = await response.json();
                renderTransactions();
                updateOverview();
                renderExpensePieChart();
                renderIncomeBarChart();
            } else {
                console.error('Falha ao buscar transações:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
        }
    }

    function renderTransactions() {
        transactionList.innerHTML = '';
        let transactionsToRender = [...transactions];

        const sortValue = sortTypeSelect.value;
        transactionsToRender.sort((a, b) => {
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

        if (transactionsToRender.length === 0) {
            transactionList.innerHTML = '<p style="text-align: center;">Nenhuma transação encontrada com os filtros aplicados.</p>';
            return;
        }

        transactionsToRender.forEach(transaction => {
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

    // --- Função para Renderizar o Gráfico de Despesas por Categoria ---
    async function renderExpensePieChart() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/reports/expenses-by-category', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Falha ao buscar dados do relatório de despesas:', response.statusText);
                expensePieChartCanvas.style.display = 'none';
                noExpenseDataMessage.style.display = 'block';
                return;
            }

            const reportData = await response.json();
            console.log("DEBUG: Dados do relatório de despesas por categoria:", reportData);

            if (expensePieChartInstance) {
                expensePieChartInstance.destroy();
            }

            if (reportData.length === 0) {
                expensePieChartCanvas.style.display = 'none';
                noExpenseDataMessage.style.display = 'block';
                return;
            } else {
                expensePieChartCanvas.style.display = 'block';
                noExpenseDataMessage.style.display = 'none';
            }

            const labels = reportData.map(item => item.category);
            const data = reportData.map(item => parseFloat(item.total_amount));
            const totalExpenses = data.reduce((sum, current) => sum + current, 0);

            const backgroundColors = data.map(() => {
                const r = Math.floor(Math.random() * 255);
                const g = Math.floor(Math.random() * 255);
                const b = Math.floor(Math.random() * 255);
                return `rgba(${r}, ${g}, ${b}, 0.7)`;
            });
            const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));

            const chartData = {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            };

            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += 'R$ ' + context.parsed.toFixed(2).replace('.', ',');
                                    if (totalExpenses > 0) {
                                        const percentage = ((context.parsed / totalExpenses) * 100).toFixed(2);
                                        label += ` (${percentage}%)`;
                                    }
                                }
                                return label;
                            }
                        }
                    }
                }
            };

            expensePieChartInstance = new Chart(expensePieChartCanvas, {
                type: 'pie',
                data: chartData,
                options: chartOptions,
            });

        } catch (error) {
            console.error('Erro ao renderizar gráfico de despesas:', error);
            expensePieChartCanvas.style.display = 'none';
            noExpenseDataMessage.style.display = 'block';
        }
    }

    // --- Função para Renderizar o Gráfico de Barras de Receitas ---
    async function renderIncomeBarChart() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/reports/incomes-by-category', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Falha ao buscar dados do relatório de receitas:', response.statusText);
                incomeBarChartCanvas.style.display = 'none';
                noIncomeDataMessage.style.display = 'block';
                return;
            }

            const reportData = await response.json();
            console.log("DEBUG: Dados do relatório de receitas por categoria:", reportData);

            if (incomeBarChartInstance) {
                incomeBarChartInstance.destroy();
            }

            if (reportData.length === 0) {
                incomeBarChartCanvas.style.display = 'none';
                noIncomeDataMessage.style.display = 'block';
                return;
            } else {
                incomeBarChartCanvas.style.display = 'block';
                noIncomeDataMessage.style.display = 'none';
            }

            const labels = reportData.map(item => item.category);
            const data = reportData.map(item => parseFloat(item.total_amount));
            const totalIncomes = data.reduce((sum, current) => sum + current, 0);

            const backgroundColor = 'rgba(75, 192, 192, 0.7)';
            const borderColor = 'rgba(75, 192, 192, 1)';

            const chartData = {
                labels: labels,
                datasets: [{
                    label: 'Receita Total',
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 1
                }]
            };

            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += 'R$ ' + context.parsed.y.toFixed(2).replace('.', ',');
                                    if (totalIncomes > 0) {
                                        const percentage = ((context.parsed.y / totalIncomes) * 100).toFixed(2);
                                        label += ` (${percentage}%)`;
                                    }
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2).replace('.', ',');
                            }
                        }
                    }
                }
            };

            incomeBarChartInstance = new Chart(incomeBarChartCanvas, {
                type: 'bar',
                data: chartData,
                options: chartOptions,
            });

        } catch (error) {
            console.error('Erro ao renderizar gráfico de receitas:', error);
            incomeBarChartCanvas.style.display = 'none';
            noIncomeDataMessage.style.display = 'block';
        }
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
                fetchBudgets(); // Atualiza orçamentos após nova transação
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

    // Função de Excluir Transação
    async function deleteTransaction(id) {
        const token = localStorage.getItem('token');
        console.log("DEBUG: Tentando deletar transação com ID:", id);
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
                    fetchBudgets(); // Atualiza orçamentos após exclusão de transação
                } else {
                    const errorData = await response.json();
                    alert(`Erro ao excluir transação: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Erro na requisição DELETE:', error);
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

    // NOVO: Listeners para Orçamentos
    manageBudgetsBtn.onclick = async () => {
        budgetForm.reset();
        budgetIdInput.value = '';
        populateBudgetMonths(); // Preenche meses e ano
        await fetchCategories(); // Garante categorias para o select
        await fetchBudgets(); // Busca todos os orçamentos para listar no modal
        budgetManagementModal.style.display = 'flex';
    };
    closeBudgetModalBtn.onclick = () => {
        budgetManagementModal.style.display = 'none';
    };
    budgetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addEditBudget();
    });

    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }

    // Event listener para o botão de Exportar Transações
    exportTransactionsBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para exportar transações.');
            window.location.href = 'login.html';
            return;
        }

        const exportUrl = '/api/export/transactions';

        try {
            const response = await fetch(exportUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Erro ao exportar transações: ${errorData.message || 'Erro desconhecido.'}`);
                console.error("DEBUG: Resposta de erro da exportação:", errorData);
                return;
            }

            const csvText = await response.text();

            if (csvText.startsWith('{') && csvText.includes('message')) {
                const data = JSON.parse(csvText);
                alert(data.message);
                return;
            }

            const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
            const blobUrl = URL.createObjectURL(blob);

            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = 'transacoes.csv';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(blobUrl);

            alert('Exportação iniciada. Seu arquivo será baixado (verifique a pasta de downloads).');

        } catch (error) {
            console.error('DEBUG: Erro na requisição de exportação (código JS):', error);
            alert('Erro ao comunicar com o servidor.');
        }
    });


    window.onclick = (event) => {
        if (event.target == transactionFormModal) {
            transactionFormModal.style.display = 'none';
        }
        if (event.target == categoryManagementModal) {
            categoryManagementModal.style.display = 'none';
        }
        if (event.target == budgetManagementModal) { // NOVO: Fechar modal de orçamento
            budgetManagementModal.style.display = 'none';
        }
    };

    // Event listeners para os filtros
    applyFiltersBtn.addEventListener('click', fetchTransactions);
    resetFiltersBtn.addEventListener('click', () => {
        filterDescriptionInput.value = '';
        filterTypeSelect.value = '';
        filterCategorySelect.value = '';
        filterStartDateInput.value = '';
        filterEndDateInput.value = '';
        fetchTransactions();
    });

    filterDescriptionInput.addEventListener('input', () => { /* Não dispara fetch aqui, espera botão */ });
    filterTypeSelect.addEventListener('change', () => { /* Não dispara fetch aqui, espera botão */ });
    filterCategorySelect.addEventListener('change', () => { /* Não dispara fetch aqui, espera botão */ });
    filterStartDateInput.addEventListener('change', () => { /* Não dispara fetch aqui, espera botão */ });
    filterEndDateInput.addEventListener('change', () => { /* Não dispara fetch aqui, espera botão */ });


    sortTypeSelect.addEventListener('change', renderTransactions);

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    typeInput.addEventListener('change', populateCategorySelect);

    // --- Inicialização ---
    await checkAuth();
    await fetchCategories();
    fetchTransactions(); // Inicia o fetch que vai atualizar transações, visão geral e gráficos
    fetchBudgets(); // NOVO: Busca e renderiza os orçamentos
});