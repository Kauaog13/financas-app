const pool = require('../config/db');

class TransactionModel {
    static async createTransaction(userId, description, amount, type, date) {
        const [result] = await pool.execute(
            'INSERT INTO transactions (user_id, description, amount, type, date) VALUES (?, ?, ?, ?, ?)',
            [userId, description, amount, type, date]
        );
        return result.insertId;
    }

    static async getTransactionsByUserId(userId) {
        const [rows] = await pool.execute(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC',
            [userId]
        );
        return rows;
    }

    static async getTransactionById(transactionId, userId) {
        const [rows] = await pool.execute(
            'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
            [transactionId, userId]
        );
        return rows[0];
    }

    static async updateTransaction(transactionId, userId, description, amount, type, date) {
        const [result] = await pool.execute(
            'UPDATE transactions SET description = ?, amount = ?, type = ?, date = ? WHERE id = ? AND user_id = ?',
            [description, amount, type, date, transactionId, userId]
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
}

module.exports = TransactionModel;