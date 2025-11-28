import express from 'express';
import {
  addAddress, getAddresses, updateAddress, deleteAddress} from '../controllers/addressController.js';

const router = express.Router();

router.post('/add', addAddress);
router.get('/:customerId', getAddresses);
router.put('/update/:id', updateAddress);
router.delete('/delete/:id', deleteAddress); 

export default router;