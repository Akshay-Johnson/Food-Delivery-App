import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// STORAGE CONFIG
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },

  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});

const upload = multer({ storage });

// POST /api/upload/profile
router.post("/profile", upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File not uploaded" });
  }

  const fullUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;

  res.json({
    message: "Uploaded successfully",
    imageUrl: req.file.path,
  });
});

export default router;
