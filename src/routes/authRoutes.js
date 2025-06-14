const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', authenticateToken, authController.verifyToken);

module.exports = router;