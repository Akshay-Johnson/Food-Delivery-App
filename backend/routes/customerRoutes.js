import express from 'express';
import {
    registerCustomer,
    loginCustomer,
    getCustomerProfile,
    editProfile,
    saveFCMToken
} from '../controllers/customerController.js';

import protectCustomer from '../middlewares/authMiddleware.js';

import { testCustomerPush } from "../controllers/customerController.js";




const router = express.Router();

router.post('/register',registerCustomer);
router.post("/login", loginCustomer);

router.get("/profile", protectCustomer, getCustomerProfile);
router.put("/profile/edit", protectCustomer, editProfile);

router.put("/fcm-token", protectCustomer, saveFCMToken);

router.post("/test-push", protectCustomer, testCustomerPush);

export default router;