import Address from "../models/addressModel.js";
import mongoose from "mongoose";

//add new address
export const addAddress = async (req, res) => {
    try {
        const customerId = req.customer.id;


        const {
             fullName, 
             phone, 
             addressLine1, 
             addressLine2, 
             city, 
             state, 
             pincode, 
             landmark, 
             type 
        } = req.body;

        const newAddress = await Address.create({
            customerId,
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            landmark,
            type,
        }); 

        res.status(201).json({ 
            message: 'Address added successfully',
            address: newAddress 
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message
         });
    }
};

//get all addresses
export const getAddresses = async (req, res) => {
    try {
        const customerId = req.customer.id;

        const addresses = await Address.find({ customerId });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//update address
export const updateAddress = async (req, res) => {
    try {
        const updatedAddress = await Address.findByIdAndUpdate(req.params.id,req.body, { new: true });
        res.status(200).json({ message: 'Address updated successfully', address: updatedAddress });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//delete address
export const deleteAddress = async (req, res) => {
    try {
        await Address.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const addressId = req.params.id;

    console.log("customerId:", customerId);
    console.log("addressId:", addressId);

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }

    // Remove default from all addresses
    await Address.updateMany(
      { customerId },      // <-- MUST MATCH schema field
      { $set: { isDefault: false } }
    );

    // Set selected default
    const updated = await Address.findByIdAndUpdate(
      addressId,
      { isDefault: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.json({
      message: "Default address updated",
      address: updated,
    });

  } catch (error) {
    console.log("SET DEFAULT ERROR:", error);
    return res.status(500).json({ message: "Server error in setting default", error });
  }
};
