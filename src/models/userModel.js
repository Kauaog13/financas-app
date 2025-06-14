const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {
    static async createUser(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        return result.insertId;
    }

    static async findUserByEmail(email) {
        const [rows] = await pool.execute('SELECT id, username, email, password, role FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findUserById(id) {
        const [rows] = await pool.execute('SELECT id, username, email, password, role FROM users WHERE id = ?', [id]);
        return rows[0];
    }
    
    static async updateUserRole(userId, newRole) {
        const [result] = await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [newRole, userId]
        );
        return result.affectedRows > 0;
    }

    static async getAllUsers() {
        const [rows] = await pool.execute('SELECT id, username, email, role, created_at FROM users');
        return rows;
    }

    static async deleteUser(userId) {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
        return result.affectedRows > 0;
    }
}

module.exports = UserModel;