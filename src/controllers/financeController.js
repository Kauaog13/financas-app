const TransactionModel = require('../models/transactionModel');

exports.createTransaction = async (req, res) => {
    const { description, amount, type, date, category_id } = req.body;
    const userId = req.user.id;

    if (!description || !amount || !type || !date) {
        return res.status(400).json({ message: 'Campos de descrição, valor, tipo e data são obrigatórios.' });
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Valor deve ser um número positivo.' });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Tipo de transação inválido. Deve ser "income" ou "expense".' });
    }
    if (category_id !== null && isNaN(parseInt(category_id))) {
        return res.status(400).json({ message: 'ID da categoria inválido.' });
    }

    try {
        const newTransactionId = await TransactionModel.createTransaction(userId, description, amount, type, date, category_id);
        res.status(201).json({ message: 'Transação criada com sucesso!', id: newTransactionId });
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar transação.' });
    }
};

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

exports.updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { description, amount, type, date, category_id } = req.body;
    const userId = req.user.id;

    if (!description || !amount || !type || !date) {
        return res.status(400).json({ message: 'Campos de descrição, valor, tipo e data são obrigatórios.' });
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Valor deve ser um número positivo.' });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Tipo de transação inválido. Deve ser "income" ou "expense".' });
    }
    if (category_id !== null && isNaN(parseInt(category_id))) {
        return res.status(400).json({ message: 'ID da categoria inválido.' });
    }

    try {
        const updated = await TransactionModel.updateTransaction(parseInt(id), userId, description, amount, type, date, category_id);
        if (!updated) {
            return res.status(404).json({ message: 'Transação não encontrada ou você não tem permissão para atualizá-la.' });
        }
        res.status(200).json({ message: 'Transação atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar transação.' });
    }
};

// Função de Excluir Transação - Confirmada para estar correta
exports.deleteTransaction = async (req, res) => {
    const { id } = req.params; // ID da transação da URL
    const userId = req.user.id; // ID do usuário do token JWT

    try {
        // O modelo exige o transactionId e o userId para garantir que o usuário só exclua suas próprias transações
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