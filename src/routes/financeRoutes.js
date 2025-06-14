const express = require('express');
const financeController = require('../controllers/financeController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/transactions', authenticateToken, financeController.createTransaction);
router.get('/transactions', authenticateToken, financeController.getTransactions);
router.get('/transactions/:id', authenticateToken, financeController.getTransactionById);
router.put('/transactions/:id', authenticateToken, financeController.updateTransaction);
router.delete('/transactions/:id', authenticateToken, financeController.deleteTransaction);

module.exports = router;