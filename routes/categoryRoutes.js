import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';
import { verifyToken, isAdminOrManager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', verifyToken, isAdminOrManager, createCategory);
router.delete('/:id', verifyToken, isAdminOrManager, deleteCategory);

export default router;
