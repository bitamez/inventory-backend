import express from 'express';
import {
  getStockTransactions, getStockTransactionById, addStock, getStockByProduct
} from '../controllers/stockController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',                        verifyToken, getStockTransactions);
router.post('/',                       verifyToken, addStock);
router.get('/:id',                     verifyToken, getStockTransactionById);
router.get('/product/:productId',      verifyToken, getStockByProduct);

export default router;
