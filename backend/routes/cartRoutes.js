import express from 'express';
import {
    addToCart,
    updateCartItem,
    getCart,
    removeCartItem,
    clearCart
} from '../controllers/cartController.js';

import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add', auth, addToCart);

router.put('/update/:itemId', auth, updateCartItem);

router.delete('/remove/:itemId', auth, removeCartItem);

router.get('/', auth, getCart);

router.delete('/clear', auth, clearCart);   

export default router;

    