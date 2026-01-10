import express from "express";
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/profile", upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File not uploaded" });
    }

    console.log("CLOUDINARY FILE:", req.file);   // DEBUG

    res.json({
      message: "Uploaded successfully",
      imageUrl: req.file.path,   // Cloudinary URL
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);       // CRITICAL
    res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
});

export default router;
