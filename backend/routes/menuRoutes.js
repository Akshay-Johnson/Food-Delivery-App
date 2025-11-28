import express from 'express';
import {
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMyMenu,
    getMenuByRestaurant,
    getMenuItemById
} from '../controllers/menuController.js';

import { protectRestaurant } from '../middlewares/restaurantAuth.js';

const router = express.Router();

router.post('/', protectRestaurant, addMenuItem);
router.put('/:id', protectRestaurant, updateMenuItem);
router.delete('/:id', protectRestaurant, deleteMenuItem);
router.get('/my/menu', protectRestaurant, getMyMenu);

//PUBLIC routes
router.get('/restaurant/:restaurantId', getMenuByRestaurant);
router.get('/:id', getMenuItemById);

export default router;