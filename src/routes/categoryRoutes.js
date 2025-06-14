const express = require('express');
const categoryController = require('../controllers/categoryController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authenticateToken, categoryController.createCategory);
router.get('/', authenticateToken, categoryController.getCategories);
router.put('/:id', authenticateToken, categoryController.updateCategory);
router.delete('/:id', authenticateToken, categoryController.deleteCategory);

module.exports = router;