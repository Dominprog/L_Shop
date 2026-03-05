import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cartController';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Управление корзиной
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Получить корзину пользователя
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Список товаров в корзине
 *       401:
 *         description: Не авторизован
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
 *     summary: Обновить количество товара
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: number }
 *     responses:
 *       200:
 *         description: Количество обновлено
 */
router.put('/:productId', requireAuth, updateCartItem);

/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     summary: Удалить товар из корзины
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
 *         description: Товар удалён
 */
router.delete('/:productId', requireAuth, removeFromCart);

export default router;