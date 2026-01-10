import express from "express";
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/profile", upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File not uploaded" });
  }

  res.json({
    message: "Uploaded successfully",
    imageUrl: req.file.path, // Cloudinary URL
  });
});

export default router;
