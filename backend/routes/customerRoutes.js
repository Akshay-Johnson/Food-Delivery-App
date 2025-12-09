import express from 'express';
import {
    registerCustomer,
    loginCustomer,
    getCustomerProfile,
    editProfile
} from '../controllers/customerController.js';

import protectCustomer from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register',registerCustomer);
router.post("/login", loginCustomer);

router.get("/profile", protectCustomer, getCustomerProfile);
router.put("/profile/edit", protectCustomer, editProfile);

export default router;