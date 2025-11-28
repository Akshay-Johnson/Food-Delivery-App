import express from 'express';
import {

    registerRestaurant,
    loginRestaurant,
    getRestaurantProfile,
    updateRestaurantProfile,
    getAllRestaurants,
    getRestaurantById,
    addCaregory,
    removeCategory,
    getCategories,
    

} from '../controllers/restaurantController.js';
import { protectRestaurant } from '../middlewares/restaurantAuth.js';

const router = express.Router();

router.post('/register', registerRestaurant);
router.post('/login', loginRestaurant);

router.get('/profile', protectRestaurant, getRestaurantProfile);
router.put('/profile', protectRestaurant, updateRestaurantProfile);

router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);

router.post('/categories', protectRestaurant, addCaregory);
router.delete("/category", protectRestaurant, removeCategory);

router.get('/:id/categories', getCategories);



export default router;