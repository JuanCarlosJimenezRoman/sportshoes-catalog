// src/routes/sizes.js
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as sizeController from '../controllers/sizeController.js';

const router = Router();

router.get('/ranges', sizeController.getSizeRanges);
router.get('/table', sizeController.getSizeTable);
router.post('/toggle', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), sizeController.toggleSize);
router.post('/batch-toggle', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), sizeController.batchToggleSizes);
router.post('/activate-all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), sizeController.activateAllSizes);
router.post('/deactivate-all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), sizeController.deactivateAllSizes);

export default router;