import express from "express";

import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  editProfile,
  saveFCMToken,
  sendCustomerEmailOtp,
} from "../controllers/customerController.js";

import protectCustomer from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";

import {
  customerRegisterSchema,
  customerLoginSchema,
  customerUpdateSchema,
} from "../models/validations/customer.js";

const router = express.Router();

//customer registration and login
router.post("/send-otp", sendCustomerEmailOtp);
router.post("/register", validate(customerRegisterSchema), registerCustomer);
router.post("/login", validate(customerLoginSchema), loginCustomer);

//profile routes
router.get("/profile", protectCustomer, getCustomerProfile);

router.put(
  "/profile/edit",
  protectCustomer,
  validate(customerUpdateSchema),
  editProfile
);

//save fcm token
router.put("/fcm-token", protectCustomer, saveFCMToken);

export default router;
