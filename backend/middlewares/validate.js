export const validate = (schema) => (req, res, next) => {
  console.log("Validation Body:", req.body);
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    console.log("Validation Error:", error.message);
    return res.status(400).json({
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  req.body = value;
  next();
};
