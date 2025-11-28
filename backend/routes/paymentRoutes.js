import express from 'express';
import {
    createPaymentOrder,
    verifyPayment,
    codPayment
} from '../controllers/paymentController.js';

import  auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create-order', auth, createPaymentOrder);
router.post('/verify', auth, verifyPayment);
router.post('/cod', auth, codPayment);

export default router;