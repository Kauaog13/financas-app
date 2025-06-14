const CategoryModel = require('../models/categoryModel');

exports.createCategory = async (req, res) => {
    const { name, type } = req.body;
    const userId = req.user.id;

    if (!name || !type) {
        return res.status(400).json({ message: 'Nome e tipo da categoria são obrigatórios.' });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Tipo de categoria inválido. Deve ser "income" ou "expense".' });
    }

    try {
        const newCategoryId = await CategoryModel.createCategory(userId, name, type);
        res.status(201).json({ message: 'Categoria criada com sucesso!', id: newCategoryId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Você já possui uma categoria com este nome.' });
        }
        console.error('Erro ao criar categoria:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar categoria.' });
    }
};

exports.getCategories = async (req, res) => {
    const userId = req.user.id;
    try {
        const categories = await CategoryModel.getCategoriesByUserId(userId);
        res.status(200).json(categories);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar categorias.' });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, type } = req.body;
    const userId = req.user.id;

    if (!name || !type) {
        return res.status(400).json({ message: 'Nome e tipo da categoria são obrigatórios.' });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Tipo de categoria inválido. Deve ser "income" ou "expense".' });
    }

    try {
        const updated = await CategoryModel.updateCategory(parseInt(id), userId, name, type);
        if (!updated) {
            return res.status(404).json({ message: 'Categoria não encontrada ou você não tem permissão para atualizá-la.' });
        }
        res.status(200).json({ message: 'Categoria atualizada com sucesso!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Você já possui outra categoria com este nome.' });
        }
        console.error('Erro ao atualizar categoria:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar categoria.' });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const deleted = await CategoryModel.deleteCategory(parseInt(id), userId);
        if (!deleted) {
            return res.status(404).json({ message: 'Categoria não encontrada ou você não tem permissão para excluí-la.' });
        }
        res.status(200).json({ message: 'Categoria excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir categoria.' });
    }
};