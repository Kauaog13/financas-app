const express = require('express');
const exportController = require('../controllers/exportController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

// Define o Content-Type como text/csv para todas as respostas desta rota,
// garantindo que ele seja definido cedo.
router.use((req, res, next) => {
    res.type('text/csv'); // Define o Content-Type para todas as respostas desta rota
    next();
});

// A rota GET para /api/export/transactions, protegida por autenticação
router.get('/transactions', authenticateToken, exportController.exportTransactionsToCsv);

module.exports = router;