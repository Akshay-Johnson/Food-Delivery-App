import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    trackOrderStatus,   
} from '../controllers/orderController.js';

import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', auth, createOrder);
router.get('/my-orders', auth, getMyOrders);
router.get('/:id', auth, getOrderById);
router.get('/track/:id', auth, trackOrderStatus);

export default router;