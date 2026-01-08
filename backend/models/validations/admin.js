import Joi from "joi";

// register admin
export const adminRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
  }),

  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be 6 digits",
    "string.empty": "OTP is required",
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

  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm Password is required",
  }),
}).with("password", "confirmPassword");


//login admin
export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email",
    "string.empty": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});
