import { Router } from 'express';
import { getProducts, getProductById, getCategories } from '../controllers/productsController';

const router = Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

export default router;

