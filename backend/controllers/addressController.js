import Address from "../models/addressModel.js";

//add new address
export const addAddress = async (req, res) => {
    try {
        const { fullName, phone, addressLine1, addressLine2, city, state, pincode, landmark, type } = req.body;
        const newAddress = await Address.create({
            customerId: req.body.customerId,
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

        res.status(201).json({ message: 'Address added successfully', address: newAddress });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//get all addresses
export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ customerId: req.params.customerId });
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



