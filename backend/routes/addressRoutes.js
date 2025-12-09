import express from 'express';
import {

  addAddress, 
  getAddresses, 
  updateAddress, 
  deleteAddress,
  setDefaultAddress

}  from '../controllers/addressController.js';
import protectCustomer from '../middlewares/authMiddleware.js';

const router = express.Router();

router.put('/default/:id', protectCustomer, setDefaultAddress); 
router.post('/add', protectCustomer, addAddress);
router.get('/', protectCustomer, getAddresses);
router.put('/update/:id', protectCustomer, updateAddress);
router.delete('/delete/:id', protectCustomer, deleteAddress); 


export default router;