# L_Shop

Интернет-магазин на Express + TypeScript (бэк) и TypeScript SPA (фронт).

## Структура

```
L_Shop/
├── backend/
│   ├── src/
│   │   ├── controllers/   # usersController, productsController, cartController, deliveryController
│   │   ├── routes/        # users, products, cart, delivery
│   │   ├── middleware/    # auth.ts, fileHelper.ts
│   │   ├── types/         # все интерфейсы
│   │   ├── data/          # users.json, products.json, deliveries.json
│   │   └── index.ts       # запуск сервера
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/    # Header.ts, ProductCard.ts
    │   ├── pages/         # Home, Register, Login, Cart, Delivery
    │   ├── utils/         # api.ts, router.ts
    │   ├── types/         # index.ts
    │   └── app.ts         # точка входа
    ├── public/
    │   ├── index.html
    │   ├── styles.css
    │   └── js/            # сюда esbuild кладёт app.js
    ├── package.json
    └── tsconfig.json
```

## Запуск

### 1. Бэкенд
```bash
cd backend
npm install
npm run dev
# сервер на http://localhost:3001
```

### 2. Фронтенд
```bash
cd frontend
npm install
npm run build        # esbuild компилирует src/app.ts -> public/js/app.js
npx serve public -l 3000
# открыть http://localhost:3000
```

## API

| Метод | URL | Описание |
|-------|-----|----------|
| POST | /api/users/register | Регистрация |
| POST | /api/users/login | Вход |
| POST | /api/users/logout | Выход |
| GET  | /api/users/me | Текущий пользователь |
| GET  | /api/products?search=&category=&sort=&available= | Товары |
| GET  | /api/products/categories | Категории |
| GET  | /api/products/:id | Товар |
| GET  | /api/cart | Корзина |
| POST | /api/cart | Добавить в корзину |
| PUT  | /api/cart/:productId | Изменить количество |
| DELETE | /api/cart/:productId | Удалить из корзины |
| GET  | /api/delivery | Доставки |
| POST | /api/delivery | Оформить доставку |
