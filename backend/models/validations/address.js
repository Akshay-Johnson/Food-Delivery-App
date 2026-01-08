import Joi from "joi";

/* ================= ADDRESS VALIDATION ================= */
export const addressSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 2 characters",
  }),

  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "string.empty": "Phone number is required",
    }),

  addressLine1: Joi.string().min(5).max(200).required().messages({
    "string.empty": "Address Line 1 is required",
    "string.min": "Address Line 1 must be at least 5 characters",
  }),

  addressLine2: Joi.string().max(200).allow("").optional(),

  city: Joi.string().min(2).max(50).required().messages({
    "string.empty": "City is required",
  }),

  state: Joi.string().min(2).max(50).required().messages({
    "string.empty": "State is required",
  }),

  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Pincode must be 6 digits",
      "string.empty": "Pincode is required",
    }),

  landmark: Joi.string().max(100).allow("").optional(),

  type: Joi.string()
    .valid("Home", "Work", "Other", "home", "work", "other")
    .optional()
    .messages({
      "any.only": "Address type must be Home, Work, or Other",
    }),

  isDefault: Joi.boolean().optional(),
});

export const addressUpdateSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),

  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
    }),

  addressLine1: Joi.string().min(5).max(200).optional(),

  addressLine2: Joi.string().max(200).allow("").optional(),

  city: Joi.string().min(2).max(50).optional(),

  state: Joi.string().min(2).max(50).optional(),

  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional()
    .messages({
      "string.pattern.base": "Pincode must be 6 digits",
    }),

  landmark: Joi.string().max(100).allow("").optional(),

  type: Joi.string()
    .valid("Home", "Work", "Other", "home", "work", "other")
    .optional(),

  isDefault: Joi.boolean().optional(),
});
