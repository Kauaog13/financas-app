const BudgetModel = require('../models/budgetModel');
const TransactionModel = require('../models/transactionModel'); // Para buscar gastos atuais por categoria

exports.createBudget = async (req, res) => {
    const { category_id, amount_limit, month, year } = req.body;
    const userId = req.user.id;

    if (!category_id || !amount_limit || !month || !year) {
        return res.status(400).json({ message: 'Todos os campos do orçamento são obrigatórios.' });
    }
    if (isNaN(parseFloat(amount_limit)) || parseFloat(amount_limit) <= 0) {
        return res.status(400).json({ message: 'Limite de valor deve ser um número positivo.' });
    }
    if (month < 1 || month > 12 || year < 2000 || year > 2100) { // Validação de ano simples
        return res.status(400).json({ message: 'Mês ou ano inválidos.' });
    }

    try {
        const newBudgetId = await BudgetModel.createBudget(userId, category_id, amount_limit, month, year);
        res.status(201).json({ message: 'Orçamento criado com sucesso!', id: newBudgetId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Você já possui um orçamento para esta categoria neste mês/ano.' });
        }
        console.error('Erro ao criar orçamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar orçamento.' });
    }
};

exports.getBudgets = async (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query; // Permite filtrar orçamentos por mês/ano

    try {
        let budgets = await BudgetModel.getBudgetsByUserId(userId, month, year);

        // Para cada orçamento, calcule o gasto atual para o mês/ano correspondente
        const currentYear = year || new Date().getFullYear();
        const currentMonth = month || (new Date().getMonth() + 1); // JS month is 0-11

        // Busca todas as despesas por categoria para o mês e ano atual, ou para o mês/ano filtrado
        const expensesForPeriod = await TransactionModel.getExpensesByCategoryForPeriod(userId, currentMonth, currentYear);
        const expensesMap = new Map();
        expensesForPeriod.forEach(item => {
            expensesMap.set(item.category_id, parseFloat(item.total_amount));
        });

        budgets = budgets.map(budget => ({
            ...budget,
            amount_limit: parseFloat(budget.amount_limit), // Garante que é número
            current_expense: expensesMap.get(budget.category_id) || 0 // Pega o gasto atual, ou 0 se não houver
        }));

        res.status(200).json(budgets);
    } catch (error) {
        console.error('Erro ao buscar orçamentos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar orçamentos.' });
    }
};

exports.updateBudget = async (req, res) => {
    const { id } = req.params;
    const { category_id, amount_limit, month, year } = req.body;
    const userId = req.user.id;

    if (!category_id || !amount_limit || !month || !year) {
        return res.status(400).json({ message: 'Todos os campos do orçamento são obrigatórios.' });
    }
    if (isNaN(parseFloat(amount_limit)) || parseFloat(amount_limit) <= 0) {
        return res.status(400).json({ message: 'Limite de valor deve ser um número positivo.' });
    }
    if (month < 1 || month > 12 || year < 2000 || year > 2100) {
        return res.status(400).json({ message: 'Mês ou ano inválidos.' });
    }

    try {
        const updated = await BudgetModel.updateBudget(parseInt(id), userId, category_id, amount_limit, month, year);
        if (!updated) {
            return res.status(404).json({ message: 'Orçamento não encontrado ou você não tem permissão para atualizá-lo.' });
        }
        res.status(200).json({ message: 'Orçamento atualizado com sucesso!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Você já possui outro orçamento para esta categoria neste mês/ano.' });
        }
        console.error('Erro ao atualizar orçamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar orçamento.' });
    }
};

exports.deleteBudget = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const deleted = await BudgetModel.deleteBudget(parseInt(id), userId);
        if (!deleted) {
            return res.status(404).json({ message: 'Orçamento não encontrado ou você não tem permissão para excluí-lo.' });
        }
        res.status(200).json({ message: 'Orçamento excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir orçamento.' });
    }
};