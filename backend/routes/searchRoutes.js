import express from 'express';
import { searchAll } from '../controllers/searchController.js';

const router = express.Router();

//PUBLIC : search restaurants and dishes
router.get('/search', searchAll);

export default router;