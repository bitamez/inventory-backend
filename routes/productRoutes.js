import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { verifyToken, isAdminOrManager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(verifyToken, getProducts)
  .post(verifyToken, isAdminOrManager, createProduct);

router.route('/:id')
  .get(verifyToken, getProductById)
  .put(verifyToken, isAdminOrManager, updateProduct)
  .delete(verifyToken, isAdminOrManager, deleteProduct);

export default router;
