import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../services/uploadService.js';
import * as productController from '../controllers/productController.js';

const router = Router();

router.get('/', productController.getProducts);
router.get('/filters', productController.getProductFilters);
router.get('/available-sizes', productController.getAvailableSizes);
router.get('/create/form-data', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.getCreateFormData);
router.get('/:id', productController.getProduct);
router.get('/:id/variants', productController.getProductVariants);

router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.createProduct);

router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.deleteProduct);

router.post('/:id/images', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), upload.array('images', 10), productController.uploadProductImages);
router.delete('/:productId/images/:imageId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.deleteProductImage);
router.put('/:productId/images/:imageId/main', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.setMainImage);

router.put('/variants/:variantId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), productController.updateVariant);

export default router;