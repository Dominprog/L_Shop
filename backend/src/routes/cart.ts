import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cartController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getCart);
router.post('/', requireAuth, addToCart);
router.put('/:productId', requireAuth, updateCartItem);
router.delete('/:productId', requireAuth, removeFromCart);

export default router;
 