import Customer from '../models/customerModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register Customer
export const registerCustomer = async (req, res) => {
    try {
        const {name,email,password,phone} = req.body;

        const existingUser = await Customer.findOne({email});
        if(existingUser) return res.status(400).json({message: "User already exists"});

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await Customer.create({
            name,
            email,
            password: hashedPassword,
            phone,
        });

        res.status(201).json({message: "User registered successfully", user });
    } catch (error) {
        res.status(500).json({message: "Something went wrong"});
    }
};


// Login Customer
export const loginCustomer = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await Customer.findOne({email});
        if(!user) return res.status(404).json({message: "User not found"});

        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(400).json({message: "Invalid credentials"});

        const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({message: "Login successful", token, user });
    } catch (error) {
        res.status(500).json({message: "Something went wrong"});
    }
};

// Get Customer Profile
export const getCustomerProfile = async (req, res) => {
  try {
    console.log("AUTH CUSTOMER:", req.customer);   // 🟢 IMPORTANT DEBUG LOG

    const user = await Customer.findById(req.customer.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(user);

  } catch (error) {
    console.log("REQ CUSTOMER =", req.customer);

    res.status(500).json({ message: "Error fetching profile" });
  }
};

//edit customer profile 
export const editProfile = async (req, res) => {
  try {

    const customerId = req.customer.id;
    const updates = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.profileImage) updates.profileImage = req.body.profileImage;
    if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 12);

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updates,
      { new: true }
    ).select("-password");

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedCustomer });

  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};