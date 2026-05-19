// src/routes/products.js
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as productController from '../controllers/productController.js';

const router = Router();

router.get('/', productController.getProducts);
router.get('/filters', productController.getProductFilters);
router.get('/:id', productController.getProduct);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.deleteProduct);

export default router;