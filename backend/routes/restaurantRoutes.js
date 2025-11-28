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

import restaurantAuth from '../middlewares/restaurantAuth.js';

const router = express.Router();

router.post('/register', registerRestaurant);
router.post('/login', loginRestaurant);

//private restaurant routes
router.get('/profile', restaurantAuth, getRestaurantProfile);
router.put('/profile', restaurantAuth, updateRestaurantProfile);

//public listings
router.get('/', getAllRestaurants);

//search restaurants
router.get('/search', searchRestaurants);

//category routes
router.get('/:id/categories', getCategories);
router.post('/categories', restaurantAuth, addCategory);
router.delete("/categories", restaurantAuth, removeCategory);

//get restaurant by id
router.get('/:id', getRestaurantById);

export default router;