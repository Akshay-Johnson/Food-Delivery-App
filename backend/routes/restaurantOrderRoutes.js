import express from 'express';
import {
    getRestaurantOrders,
    acceptOrder,
    rejectOrder,
    markPreparing,
    markReady,
} from '../controllers/orderController.js';

import { protectRestaurant } from '../middlewares/restaurantAuth.js';

const router = express.Router();

router.get("/",protectRestaurant, getRestaurantOrders);
router.put("/accept/:id", protectRestaurant, acceptOrder);
router.put("/reject/:id", protectRestaurant, rejectOrder);
router.put("/preparing/:id", protectRestaurant, markPreparing);
router.put("/ready/:id", protectRestaurant, markReady);

export default router;
