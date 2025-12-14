import express from 'express';
import {
    addToCart,
    updateCartItem,
    getCart,
    removeCartItem,
    clearCart
} from '../controllers/cartController.js';

import  protectCustomer from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add', protectCustomer, addToCart);

router.put('/update/:itemId', protectCustomer, updateCartItem);

router.delete('/remove/:itemId', protectCustomer, removeCartItem);

router.get('/', protectCustomer, getCart);

router.delete('/clear', protectCustomer, clearCart);   

export default router;

    