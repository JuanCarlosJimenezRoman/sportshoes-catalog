import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';

const router = Router();

router.post('/create', orderController.createOrder);

export default router;