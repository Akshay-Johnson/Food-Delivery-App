import express from "express";
import upload from "../utils/upload.js";

const router = express.Router();

// POST /api/upload/profile
router.post("/profile", upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File not uploaded" });
  }

  // Cloudinary gives a permanent public URL
  res.json({
    message: "Uploaded successfully",
    imageUrl: req.file.path,   // <-- CLOUDINARY URL
  });
});

export default router;
