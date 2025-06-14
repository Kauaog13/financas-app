const express = require('express');
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeMiddleware');
const router = express.Router();

router.get('/users', authenticateToken, authorizeRoles(['admin']), adminController.getAllUsers);
router.put('/users/:id/role', authenticateToken, authorizeRoles(['admin']), adminController.updateUserRole);
router.delete('/users/:id', authenticateToken, authorizeRoles(['admin']), adminController.deleteUser);

module.exports = router;