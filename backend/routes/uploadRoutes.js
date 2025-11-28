import express from 'express';
import { upload } from '../utils/upload.js';

import { uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

//route to upload image
router.post('/image', upload.single('image'), uploadImage);

export default router;