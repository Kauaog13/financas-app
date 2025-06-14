const pool = require('../config/db');

class BudgetModel {
    static async createBudget(userId, categoryId, amountLimit, month, year) {
        const [result] = await pool.execute(
            'INSERT INTO budgets (user_id, category_id, amount_limit, month, year) VALUES (?, ?, ?, ?, ?)',
            [userId, categoryId, amountLimit, month, year]
        );
        return result.insertId;
    }

    static async getBudgetsByUserId(userId, month, year) {
        let query = `
            SELECT b.id, b.amount_limit, b.month, b.year,
                   c.id AS category_id, c.name AS category_name, c.type AS category_type
            FROM budgets b
            JOIN categories c ON b.category_id = c.id
            WHERE b.user_id = ?
        `;
        const params = [userId];

        if (month) {
            query += ` AND b.month = ?`;
            params.push(month);
        }
        if (year) {
            query += ` AND b.year = ?`;
            params.push(year);
        }

        query += ` ORDER BY b.year DESC, b.month DESC, c.name ASC`;

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getBudgetById(budgetId, userId) {
        const [rows] = await pool.execute(
            `SELECT b.id, b.amount_limit, b.month, b.year,
                    c.id AS category_id, c.name AS category_name, c.type AS category_type
             FROM budgets b
             JOIN categories c ON b.category_id = c.id
             WHERE b.id = ? AND b.user_id = ?`,
            [budgetId, userId]
        );
        return rows[0];
    }

    static async updateBudget(budgetId, userId, categoryId, amountLimit, month, year) {
        const [result] = await pool.execute(
            'UPDATE budgets SET category_id = ?, amount_limit = ?, month = ?, year = ? WHERE id = ? AND user_id = ?',
            [categoryId, amountLimit, month, year, budgetId, userId]
        );
        return result.affectedRows > 0;
    }

    static async deleteBudget(budgetId, userId) {
        const [result] = await pool.execute(
            'DELETE FROM budgets WHERE id = ? AND user_id = ?',
            [budgetId, userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = BudgetModel;