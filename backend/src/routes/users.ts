import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/usersController';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Управление пользователями
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Регистрация
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       409:
 *         description: Email уже занят
 */
router.post('/register', register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Вход
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверные данные
 */
router.post('/login', login);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Выход
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Сессия завершена
 */
router.post('/logout', logout);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Текущий пользователь
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       401:
 *         description: Не авторизован
 */
router.get('/me', requireAuth, getMe);

export default router;
