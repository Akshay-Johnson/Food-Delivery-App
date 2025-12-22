import Joi from "joi";

/* =========================
   REGISTER RESTAURANT
========================= */
export const restaurantRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Restaurant name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
  }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "string.empty": "Confirm password is required",
  }),

  phone: Joi.string().pattern(/^\d{10}$/).required().messages({
    "string.pattern.base": "Phone number must be 10 digits",
  }),

  address: Joi.string().min(5).required().messages({
    "string.empty": "Address is required",
  }),

  image: Joi.string().uri().optional(),

  description: Joi.string().max(500).optional(),

  cuisineType: Joi.string().optional(),

  categories: Joi.array().items(Joi.string()).optional(),

  openingTime: Joi.string().optional(),   // "09:00"
  closingTime: Joi.string().optional(),   // "23:00"
}).with("password", "confirmPassword");

/* =========================
   LOGIN RESTAURANT
========================= */
export const restaurantLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email",
    "string.empty": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

/* =========================
   UPDATE RESTAURANT PROFILE
========================= */
export const restaurantUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),

  phone: Joi.string().pattern(/^\d{10}$/).optional().messages({
    "string.pattern.base": "Phone number must be 10 digits",
  }),

  address: Joi.string().min(5).optional(),

  image: Joi.string().uri().optional(),

  description: Joi.string().max(500).optional(),

  cuisineType: Joi.string().optional(),

  categories: Joi.array().items(Joi.string()).optional(),

  openingTime: Joi.string().optional(),
  closingTime: Joi.string().optional(),

  password: Joi.string().min(6).optional().allow("").messages({
    "string.min": "Password must be at least 6 characters",
  }),
});
