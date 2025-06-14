const express = require('express');
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

// Rota para obter relatório de despesas por categoria
router.get('/expenses-by-category', authenticateToken, reportController.getExpensesByCategoryReport);

module.exports = router;