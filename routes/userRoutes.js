import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(verifyToken, isAdmin, getUsers)
  .post(verifyToken, isAdmin, createUser);

router.route('/:id')
  .get(verifyToken, isAdmin, getUserById)
  .put(verifyToken, isAdmin, updateUser)
  .delete(verifyToken, isAdmin, deleteUser);

export default router;
