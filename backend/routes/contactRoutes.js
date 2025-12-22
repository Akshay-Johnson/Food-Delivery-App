import express from "express";
const router = express.Router();
import { sendContactEmail } from "../controllers/contactController.js";

router.post("/send", sendContactEmail);

export default router;
