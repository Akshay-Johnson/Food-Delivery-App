import express from 'express';
import {
    getRestaurantOrders,
    acceptOrder,
    rejectOrder,
    markPreparing,
    markReady,
    assignOrderToAgent
} from '../controllers/orderController.js';

import restaurantAuth from '../middlewares/restaurantAuth.js';

const router = express.Router();

router.post('/assign-agent/:orderId', restaurantAuth, assignOrderToAgent);

router.get("/", restaurantAuth, getRestaurantOrders);

router.put("/accept/:id", restaurantAuth, acceptOrder);

router.put("/reject/:id", restaurantAuth, rejectOrder);

router.put("/preparing/:id", restaurantAuth, markPreparing);

router.put("/ready/:id", restaurantAuth, markReady);

export default router;
