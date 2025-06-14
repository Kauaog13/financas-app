const express = require('express');
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

// Rota para obter relatório de despesas por categoria (já existente)
router.get('/expenses-by-category', authenticateToken, reportController.getExpensesByCategoryReport);

// NOVO: Rota para obter relatório de receitas por categoria
router.get('/incomes-by-category', authenticateToken, reportController.getIncomesByCategoryReport);

module.exports = router;