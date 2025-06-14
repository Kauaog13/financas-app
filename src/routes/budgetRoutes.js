const express = require('express');
const budgetController = require('../controllers/budgetController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

// Todas as rotas de orçamento são protegidas
router.post('/', authenticateToken, budgetController.createBudget);
router.get('/', authenticateToken, budgetController.getBudgets);
router.put('/:id', authenticateToken, budgetController.updateBudget);
router.delete('/:id', authenticateToken, budgetController.deleteBudget);

module.exports = router;