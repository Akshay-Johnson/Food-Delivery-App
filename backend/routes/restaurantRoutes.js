import express from 'express';
import {

    registerRestaurant,
    loginRestaurant,
    getRestaurantProfile,
    updateRestaurantProfile,
    getAllRestaurants,
    getRestaurantById,
    addCategory,
    removeCategory,
    getCategories,
    searchRestaurants
    

} from '../controllers/restaurantController.js';

import { getRestaurantOrders , getAssignedOrders, assignOrderToAgent } from '../controllers/orderController.js';
import restaurantAuth from '../middlewares/restaurantAuth.js';

const router = express.Router();

router.post('/register', registerRestaurant);
router.post('/login', loginRestaurant);

//private restaurant routes
router.get('/profile', restaurantAuth, getRestaurantProfile);
router.put('/profile', restaurantAuth, updateRestaurantProfile);

router.get('/orders', restaurantAuth, getRestaurantOrders);

router.put('/assign/orders', restaurantAuth, getAssignedOrders);

router.put('/orders/assign/:orderId', restaurantAuth, assignOrderToAgent);

//public listings
router.get('/', getAllRestaurants);

//search restaurants
router.get('/search', searchRestaurants);

//category routes
router.post('/categories', restaurantAuth, addCategory);
router.delete("/categories", restaurantAuth, removeCategory);
router.get('/:id/categories', getCategories);

//get restaurant by id
router.get('/:id', getRestaurantById);

export default router;