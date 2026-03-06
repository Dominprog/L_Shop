import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import usersRouter from './routes/users';
import productsRouter from './routes/products';
import cartRouter from './routes/cart';
import deliveryRouter from './routes/delivery';

const app = express();
const PORT = 3001;

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'L_Shop API', version: '1.0.0', description: 'API интернет-магазина L_Shop' },
    servers: [{ url: 'http://localhost:3001/api' }],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' }, name: { type: 'string' },
            price: { type: 'number' }, category: { type: 'string' },
            available: { type: 'boolean' }, stock: { type: 'number' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' },
          },
        },
        Delivery: {
          type: 'object',
          properties: {
            id: { type: 'string' }, address: { type: 'string' },
            phone: { type: 'string' }, paymentMethod: { type: 'string' },
            totalPrice: { type: 'number' }, createdAt: { type: 'string' },
          },
        },
        Error: { type: 'object', properties: { error: { type: 'string' } } },
      },
      securitySchemes: { cookieAuth: { type: 'apiKey', in: 'cookie', name: 'session' } },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/delivery', deliveryRouter);

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});