import { Router } from 'express';
import { createDelivery, getDeliveries } from '../controllers/deliveryController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getDeliveries);
router.post('/', requireAuth, createDelivery);

export default router;

