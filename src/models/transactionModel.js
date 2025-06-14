const pool = require('../config/db');

class TransactionModel {
    static async createTransaction(userId, description, amount, type, date, categoryId) {
        const [result] = await pool.execute(
            'INSERT INTO transactions (user_id, description, amount, type, date, category_id) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, description, amount, type, date, categoryId]
        );
        return result.insertId;
    }

    static async getTransactionsByUserId(userId) {
        const [rows] = await pool.execute(
            `SELECT t.*, c.name AS category_name
             FROM transactions t
             LEFT JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = ?
             ORDER BY t.date DESC, t.created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async getTransactionById(transactionId, userId) {
        const [rows] = await pool.execute(
            `SELECT t.*, c.name AS category_name
             FROM transactions t
             LEFT JOIN categories c ON t.category_id = c.id
             WHERE t.id = ? AND t.user_id = ?`,
            [transactionId, userId]
        );
        return rows[0];
    }

    static async updateTransaction(transactionId, userId, description, amount, type, date, categoryId) {
        const [result] = await pool.execute(
            'UPDATE transactions SET description = ?, amount = ?, type = ?, date = ?, category_id = ? WHERE id = ? AND user_id = ?',
            [description, amount, type, date, categoryId, transactionId, userId]
        );
        return result.affectedRows > 0;
    }

    static async deleteTransaction(transactionId, userId) {
        const [result] = await pool.execute(
            'DELETE FROM transactions WHERE id = ? AND user_id = ?',
            [transactionId, userId]
        );
        return result.affectedRows > 0;
    }

    // NOVO MÉTODO: Para obter despesas agrupadas por categoria
    static async getExpensesByCategory(userId) {
        const [rows] = await pool.execute(
            `SELECT c.name AS category, SUM(t.amount) AS total_amount
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = ? AND t.type = 'expense'
             GROUP BY c.name
             ORDER BY total_amount DESC`,
            [userId]
        );
        return rows;
    }
}

module.exports = TransactionModel;