const UserModel = require('../models/userModel');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.getAllUsers();
        const usersWithoutPasswords = users.map(user => {
            const { password, ...rest } = user;
            return rest;
        });
        res.status(200).json(usersWithoutPasswords);
    } catch (error) {
        console.error('Erro ao buscar usuários (Admin):', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar usuários.' });
    }
};

exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Papel inválido. Deve ser "user" ou "admin".' });
    }
    
    if (req.user.id === parseInt(id) && role === 'user') {
        return res.status(403).json({ message: 'Você não pode rebaixar seu próprio papel de administrador.' });
    }

    try {
        const updated = await UserModel.updateUserRole(parseInt(id), role);
        if (!updated) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json({ message: 'Papel do usuário atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar papel do usuário (Admin):', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar papel do usuário.' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    if (req.user.id === parseInt(id)) {
        return res.status(403).json({ message: 'Você não pode deletar sua própria conta de administrador.' });
    }

    try {
        const deleted = await UserModel.deleteUser(parseInt(id));
        if (!deleted) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json({ message: 'Usuário excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir usuário (Admin):', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir usuário.' });
    }
};