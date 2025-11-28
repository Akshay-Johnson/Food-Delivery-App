import express from 'express';
import {
    registerAdmin,
    loginAdmin,
    getAllRestaurants,
    updateRestaurantStatus,
    getAllCustomers,
    getAllAgents,
    updateAgentStatus,
    getAllOrders,
} from '../controllers/adminController.js';

import { protectAdmin } from '../middlewares/adminAuth.js';

const router = express.Router();

//auth 
router.post('/register', registerAdmin);    
router.post('/login', loginAdmin);

//restaurant controls
router.get('/restaurants', protectAdmin, getAllRestaurants);
router.put('/restaurant/status/:id', protectAdmin, updateRestaurantStatus);

//customer controls
router.get('/customers', protectAdmin, getAllCustomers);

//delivery agent controls
router.get('/agents', protectAdmin, getAllAgents);
router.put('/agent/status/:id', protectAdmin, updateAgentStatus);

//order controls
router.get('/orders', protectAdmin, getAllOrders);

export default router;