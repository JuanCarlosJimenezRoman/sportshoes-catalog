// src/routes/facebook.js
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as facebookController from '../controllers/facebookController.js';

const router = Router();

router.get('/catalog-info', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), facebookController.getCatalogInfo);
router.get('/test-payload', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), facebookController.testPayload);
router.get('/feeds', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), facebookController.getFeeds);

router.post('/sync-all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), facebookController.syncAllProducts);
router.post('/setup-feed', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), facebookController.setupFeed);

export default router;