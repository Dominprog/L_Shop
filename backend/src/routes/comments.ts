import { Router } from 'express';
import { getComments, addComment } from '../controllers/commentsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Комментарии и оценки товаров
 */

/**
 * @swagger
 * /comments/{productId}:
 *   get:
 *     summary: Получить комментарии к товару
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Список комментариев
 */
router.get('/:productId', getComments);

/**
 * @swagger
 * /comments/{productId}:
 *   post:
 *     summary: Добавить комментарий к товару
 *     tags: [Comments]
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
 *             required: [text, rating]
 *             properties:
 *               text: { type: string }
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *     responses:
 *       201:
 *         description: Комментарий добавлен
 *       401:
 *         description: Не авторизован
 */
router.post('/:productId', requireAuth, addComment);

export default router;
