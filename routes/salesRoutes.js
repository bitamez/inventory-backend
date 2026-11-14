import express from 'express';
import { getSales, createSale, getSaleById } from '../controllers/salesController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(requireAuth, getSales)
  .post(requireAuth, createSale);

router.route('/:id')
  .get(requireAuth, getSaleById);

export default router;
