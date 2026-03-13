import { Router } from 'express';
import {
  getProducts, getProductById, getCategories,
  getRecommended, likeProduct, getLikes,
  createProduct, updateProduct, deleteProduct
} from '../controllers/productsController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Товары магазина
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price_asc, price_desc] }
 *       - in: query
 *         name: available
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Список товаров
 */
router.get('/', getProducts);

/**
 * @swagger
 * /products/categories:
 *   get:
 *     summary: Получить список категорий
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список категорий
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /products/recommended:
 *   get:
 *     summary: Получить рекомендованные товары для пользователя
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Рекомендованные товары
 */
router.get('/recommended', requireAuth, getRecommended);

/**
 * @swagger
 * /products/likes:
 *   get:
 *     summary: Получить список лайкнутых товаров
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Список id лайкнутых товаров
 */
router.get('/likes', requireAuth, getLikes);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Товар
 *       404:
 *         description: Не найден
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /products/{id}/like:
 *   post:
 *     summary: Лайкнуть / убрать лайк товара
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Статус лайка обновлён
 */
router.post('/:id/like', requireAuth, likeProduct);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создать товар (только admin)
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Товар создан
 *       403:
 *         description: Forbidden
 */
router.post('/', requireAdmin, createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Обновить товар (только admin)
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Товар обновлён
 */
router.put('/:id', requireAdmin, updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Удалить товар (только admin)
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Товар удалён
 */
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
