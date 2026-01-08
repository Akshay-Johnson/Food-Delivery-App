import express from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress,
} from "../controllers/addressController.js";

import protectCustomer from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";

import {
  addressSchema,
  addressUpdateSchema,
} from "../models/validations/address.js";

const router = express.Router();

// ================= DEFAULT ADDRESS =================
router.put("/default/:id", protectCustomer, setDefaultAddress);
router.get("/default", protectCustomer, getDefaultAddress);

// ================= CRUD =================

// Add address (full validation)
router.post("/add", protectCustomer, validate(addressSchema), addAddress);

// Get all addresses
router.get("/", protectCustomer, getAddresses);

// Update address (partial validation)
router.put(
  "/update/:id",
  protectCustomer,
  validate(addressUpdateSchema),
  updateAddress
);

// Delete address
router.delete("/delete/:id", protectCustomer, deleteAddress);

export default router;
