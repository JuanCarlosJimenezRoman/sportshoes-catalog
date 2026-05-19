// src/routes/categories.js
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.createCategory);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.deleteCategory);

export default router;