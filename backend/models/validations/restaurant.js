import Joi from "joi";

// ================= REGISTER RESTAURANT =================
export const restaurantRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Restaurant name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
  }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one number, and one special character",
      "string.empty": "Password is required",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "string.empty": "Confirm password is required",
  }),

  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "string.empty": "Phone number is required",
    }),

  address: Joi.string().min(5).required().messages({
    "string.empty": "Address is required",
  }),

  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be 6 digits",
    "string.empty": "OTP is required",
  }),

  image: Joi.string().uri().optional(),
  description: Joi.string().max(500).optional(),
  cuisineType: Joi.string().optional(),
  categories: Joi.array().items(Joi.string()).optional(),
  openingTime: Joi.string().optional(),
  closingTime: Joi.string().optional(),
}).with("password", "confirmPassword");

// ================= LOGIN RESTAURANT =================
export const restaurantLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email",
    "string.empty": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

// ================= UPDATE RESTAURANT PROFILE =================
export const restaurantUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),

  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
    }),

  address: Joi.string().min(5).optional(),

  image: Joi.string().uri().optional(),

  description: Joi.string().max(500).optional(),

  cuisineType: Joi.string().optional(),

  categories: Joi.array().items(Joi.string()).optional(),

  openingTime: Joi.string().optional(),
  closingTime: Joi.string().optional(),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/)
    .optional()
    .allow("")
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one number, and one special character",
    }),
});
