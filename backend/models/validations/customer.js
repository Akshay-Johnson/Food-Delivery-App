import Joi from "joi";

/* ================= REGISTER CUSTOMER ================= */
export const customerRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
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

  otp: Joi.string()
    .length(6)
    .required()
    .messages({
      "string.length": "OTP must be 6 digits",
      "string.empty": "OTP is required",
    }),

  profileImage: Joi.string().uri().optional(),
  fcmToken: Joi.string().allow(null).optional(),
}).with("password", "confirmPassword");

/* ================= LOGIN CUSTOMER ================= */
export const customerLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email",
    "string.empty": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

/* ================= UPDATE CUSTOMER PROFILE ================= */
export const customerUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),

  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
    }),

  password: Joi.string().min(6).optional().allow("").messages({
    "string.min": "Password must be at least 6 characters",
  }),

  profileImage: Joi.string().uri().optional(),
});
