import express from 'express';
import {
  getApprovals, getPendingApprovals, getApprovalById, processApproval
} from '../controllers/approvalController.js';
import { verifyToken, isAdminOrManager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',         verifyToken, isAdminOrManager, getApprovals);
router.get('/pending',  verifyToken, isAdminOrManager, getPendingApprovals);
router.get('/:id',      verifyToken, isAdminOrManager, getApprovalById);
router.put('/:id/process', verifyToken, isAdminOrManager, processApproval);

export default router;
