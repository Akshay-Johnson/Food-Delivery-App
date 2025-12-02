import Admin from '../models/adminModel.js';
import Customer from '../models/customerModel.js';  
import Restaurant from '../models/restaurantModel.js';  
import Order from '../models/orderModel.js';
import DeliveryAgent from '../models/deliveryAgentModel.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

//admin registration
export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await Admin.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await Admin.create({ name, email , password: hashedPassword });

        const token = generateToken(admin._id);

        res.status(201).json({
            message : 'Admin registered successfully',
            admin,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'error registering admin' });
    }
};

//admin login
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const  admin = await Admin.findOne({ email });
        
        if (!admin) {
            return res.status(400).json({ message: 'Admin not found ' });
        }

        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(admin._id);

        res.json({
            message: 'Admin logged in successfully',
            token,
            admin,
         });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in admin' });
    }
};

//get all restaurants
export const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find().select('-password');
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurants' });
    }
};

//approve or block restaurant
export const updateRestaurantStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'blocked'

        let restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        restaurant.status = status;
        await restaurant.save();

        res.json({ message: `Restaurant updated to ${status}`, restaurant });
    } catch (error) {
        res.status(500).json({ message: 'Error updating restaurant status',error: error.message });
    }
};

//get all customers
export const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().select('-password');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

//get all delivery agents
export const getAllAgents = async (req, res) => {
    try {
        const agents = await DeliveryAgent.find().select('-password');
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching delivery agents' });
    }
};

//approve or block delivery agent
export const updateAgentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'blocked'

        const agent = await DeliveryAgent.findById(id);
        if (!agent) {
            return res.status(404).json({ message: 'Delivery Agent not found' });
        }
        
        agent.status = status;
        await agent.save();

        res.json({ message: `Delivery Agent updated to ${status}`, agent });
    } catch (error) {
        res.status(500).json({ message: 'Error updating delivery agent status' });
    }
};

//get all orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
        .populate('customerId', 'name email')
        .populate('restaurantId', 'name email')
        .populate('deliveryAgentId', 'name email');

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders',error: error.message });
    }
};
        