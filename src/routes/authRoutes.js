const express = require('express');
const authController = require('../controllers/authController');
const forgotPasswordController = require('../controllers/forgotPasswordController'); // Importe o novo controller
const authenticateToken = require('../middlewares/authMiddleware'); // Assumindo que este middleware existe
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', authenticateToken, authController.verifyToken);

// rotas para "Esqueceu a Senha"
router.post('/forgot-password', forgotPasswordController.forgotPassword);
router.post('/reset-password', forgotPasswordController.resetPassword);

module.exports = router;