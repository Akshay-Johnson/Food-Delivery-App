import jwt from "jsonwebtoken";

const protectCustomer = (req, res, next) => {
  try {
    let token;

    // If Authorization header exists
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Fallback for mobile or custom clients
    else if (req.headers["x-auth-token"]) {
      token = req.headers["x-auth-token"];
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach customer ID
    req.user = { id: decoded.id };

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protectCustomer;


