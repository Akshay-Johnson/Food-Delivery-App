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

        const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({message: "Login successful", token, user });
    } catch (error) {
        res.status(500).json({message: "Something went wrong"});
    }
};