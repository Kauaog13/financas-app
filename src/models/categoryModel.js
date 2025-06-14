const pool = require('../config/db');

class CategoryModel {
    static async createCategory(userId, name, type) {
        const [result] = await pool.execute(
            'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
            [userId, name, type]
        );
        return result.insertId;
    }

    static async getCategoriesByUserId(userId) {
        const [rows] = await pool.execute(
            'SELECT id, name, type FROM categories WHERE user_id = ? ORDER BY name ASC',
            [userId]
        );
        return rows;
    }

    static async getCategoryById(categoryId, userId) {
        const [rows] = await pool.execute(
            'SELECT id, name, type FROM categories WHERE id = ? AND user_id = ?',
            [categoryId, userId]
        );
        return rows[0];
    }

    static async updateCategory(categoryId, userId, name, type) {
        const [result] = await pool.execute(
            'UPDATE categories SET name = ?, type = ? WHERE id = ? AND user_id = ?',
            [name, type, categoryId, userId]
        );
        return result.affectedRows > 0;
    }

    static async deleteCategory(categoryId, userId) {
        const [result] = await pool.execute(
            'DELETE FROM categories WHERE id = ? AND user_id = ?',
            [categoryId, userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = CategoryModel;