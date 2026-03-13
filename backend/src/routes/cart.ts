import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cartController';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Корзина
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Получить корзину
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Корзина пользователя
 */
router.get('/', requireAuth, getCart);

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Добавить товар в корзину
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: number }
 *     responses:
 *       200:
 *         description: Корзина обновлена
 */
router.post('/', requireAuth, addToCart);

/**
 * @swagger
 * /cart/{productId}:
 *   put:
 *     summary: Обновить количество
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Количество обновлено
 */
router.put('/:productId', requireAuth, updateCartItem);

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Удалить из корзины
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Удалено
 */
router.delete('/:productId', requireAuth, removeFromCart);

export default router;
