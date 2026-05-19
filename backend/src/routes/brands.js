// src/routes/brands.js
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as brandController from '../controllers/brandController.js';

const router = Router();

router.get('/', brandController.getBrands);
router.get('/:id', brandController.getBrand);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), brandController.createBrand);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), brandController.updateBrand);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), brandController.deleteBrand);

export default router;