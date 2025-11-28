import express from 'express';
import {
  addAddress, 
  getAddresses, 
  updateAddress, 
  deleteAddress} 
  from '../controllers/addressController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add', auth, addAddress);
router.get('/', auth, getAddresses);
router.put('/update/:id', auth,updateAddress);
router.delete('/delete/:id', auth, deleteAddress); 

export default router;