import express from 'express';
import {
  getStockReport, getDailyReport, getMonthlyReport, getTopProducts, getYearlySummary
} from '../controllers/reportController.js';
import { verifyToken, isAdminOrManager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stock',        verifyToken, getStockReport);
router.get('/daily',        verifyToken, isAdminOrManager, getDailyReport);
router.get('/monthly',      verifyToken, isAdminOrManager, getMonthlyReport);
router.get('/yearly',       verifyToken, isAdminOrManager, getYearlySummary);
router.get('/top-products', verifyToken, isAdminOrManager, getTopProducts);

export default router;
