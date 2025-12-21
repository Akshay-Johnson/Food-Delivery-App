import express from "express";

import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  editProfile,
  saveFCMToken,
  testCustomerPush,
} from "../controllers/customerController.js";

import protectCustomer from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";

import {
  customerRegisterSchema,
  customerLoginSchema,
  customerUpdateSchema,
} from "../models/validations/customer.js";

const router = express.Router();

/* =========================
   AUTH
========================= */
router.post(
  "/register",
  validate(customerRegisterSchema),
  registerCustomer
);

router.post(
  "/login",
  validate(customerLoginSchema),
  loginCustomer
);

/* =========================
   PROFILE
========================= */
router.get(
  "/profile",
  protectCustomer,
  getCustomerProfile
);

router.put(
  "/profile/edit",
  protectCustomer,
  validate(customerUpdateSchema),
  editProfile
);

/* =========================
   FCM
========================= */
router.put(
  "/fcm-token",
  protectCustomer,
  saveFCMToken
);

/* =========================
   TEST PUSH
========================= */
router.post(
  "/test-push",
  protectCustomer,
  testCustomerPush
);

export default router;
