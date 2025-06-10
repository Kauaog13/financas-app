const TransactionModel = require('../models/transactionModel');

// Criar uma nova transação
exports.createTransaction = async (req, res) => {
    const { description, amount, type, date } = req.body;
    const userId = req.user.id; // ID do usuário do token JWT

    if (!description || !amount || !type || !date) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Valor deve ser um número positivo.' });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Tipo de transação inválido. Deve ser "income" ou "expense".' });
    }

    try {
        const newTransactionId = await TransactionModel.createTransaction(userId, description, amount, type, date);
        res.status(201).json({ message: 'Transação criada com sucesso!', id: newTransactionId });
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar transação.' });
    }
};

// Obter todas as transações de um usuário
exports.getTransactions = async (req, res) => {
    const userId = req.user.id;

    try {
        const transactions = await TransactionModel.getTransactionsByUserId(userId);
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar transações.' });
    }
};

// Obter uma transação específica por ID
exports.getTransactionById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const transaction = await TransactionModel.getTransactionById(parseInt(id), userId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transação não encontrada ou você não tem permissão para acessá-la.' });
        }
        res.status(200).json(transaction);
    } catch (error) {
        console.error('Erro ao buscar transação por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar transação.' });
    }
};

// Atualizar uma transação existente
exports.updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { description, amount, type, date } = req.body;
    const userId = req.user.id;

    if (!description || !amount || !type || !date) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Valor deve ser um número positivo.' });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Tipo de transação inválido. Deve ser "income" ou "expense".' });
    }

    try {
        const updated = await TransactionModel.updateTransaction(parseInt(id), userId, description, amount, type, date);
        if (!updated) {
            return res.status(404).json({ message: 'Transação não encontrada ou você não tem permissão para atualizá-la.' });
        }
        res.status(200).json({ message: 'Transação atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar transação.' });
    }
};

// Excluir uma transação
exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const deleted = await TransactionModel.deleteTransaction(parseInt(id), userId);
        if (!deleted) {
            return res.status(404).json({ message: 'Transação não encontrada ou você não tem permissão para excluí-la.' });
        }
        res.status(200).json({ message: 'Transação excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir transação.' });
    }
};