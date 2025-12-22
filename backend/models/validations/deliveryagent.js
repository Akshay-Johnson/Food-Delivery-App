import Joi from "joi";

//register delivery agent
export const agentRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
  }),

  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "string.empty": "Phone number is required",
    }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),

  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "string.empty": "Confirm Password is required",
  }),

  image: Joi.string().uri().optional(),
  vehicleType: Joi.string().optional(),
  vehicleNumber: Joi.string().optional(),
}).with("password", "confirmPassword");

//login delivery agent
export const agentLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email",
    "string.empty": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

//update delivery agent profile
export const agentUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),

  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
    }),

  image: Joi.string().uri().optional(),

  vehicleType: Joi.string().optional(),

  vehicleNumber: Joi.string().optional(),

  password: Joi.string().min(6).optional().allow("").messages({
    "string.min": "Password must be at least 6 characters",
  }),
});
