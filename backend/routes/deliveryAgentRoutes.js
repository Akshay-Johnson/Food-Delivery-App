import express from 'express';
import { 
    registerAgent,
    loginAgent,
    getAgentProfile,
    updateAgentProfile,
    updateAgentLocation
} from '../controllers/deliveryAgentController.js';

import { protectAgent } from '../middlewares/agentAuth.js';
import { getAssignedOrders, markOrderPickedUp , markOrderDelivered } from '../controllers/orderController.js';

const router = express.Router();

router.post('/register', registerAgent);
router.post('/login', loginAgent);

//profile
router.get('/profile', protectAgent, getAgentProfile);
router.put('/profile', protectAgent, updateAgentProfile);

//location
router.put('/location', protectAgent, updateAgentLocation);

//order
router.get('/orders', protectAgent, getAssignedOrders);
router.put('/orders/picked/:id', protectAgent, markOrderPickedUp);
router.put('/orders/delivered/:id', protectAgent, markOrderDelivered);

export default router;
