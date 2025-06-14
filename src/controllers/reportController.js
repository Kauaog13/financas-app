const TransactionModel = require('../models/transactionModel');

exports.getExpensesByCategoryReport = async (req, res) => {
    const userId = req.user.id;

    try {
        const expensesByCategory = await TransactionModel.getExpensesByCategory(userId);
        res.status(200).json(expensesByCategory);
    } catch (error) {
        console.error('Erro ao gerar relatório de despesas por categoria:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao gerar relatório.' });
    }
};

// NOVO: Função para obter relatório de receitas por categoria
exports.getIncomesByCategoryReport = async (req, res) => {
    const userId = req.user.id;

    try {
        const incomesByCategory = await TransactionModel.getIncomesByCategory(userId);
        res.status(200).json(incomesByCategory);
    } catch (error) {
        console.error('Erro ao gerar relatório de receitas por categoria:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao gerar relatório.' });
    }
};