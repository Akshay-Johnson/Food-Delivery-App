import DeliveryAgent from "../models/deliveryAgentModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
    });
};

//register delivery agent
export const registerAgent = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const exists = await DeliveryAgent.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: 'Delivery agent already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const agent = await DeliveryAgent.create({
            name,
            email,
            phone,
            password: hashedPassword,
        });

        const token = generateToken(agent._id);

        res.status(201).json({
            message: 'Delivery agent registered successfully',
            token,
            agent
        });
    } catch (error) {
        res.status(500).json({ message: ' error registering delivery agent'  });
    }
};

//login delivery agent
export const loginAgent = async (req, res) => {
    try {
        const { email, password } = req.body;
        const agent = await DeliveryAgent.findOne({ email });
        if (!agent) {
            return res.status(400).json({ message: 'agent not found' });
        }
        const isMatch = await bcrypt.compare(password, agent.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(agent._id);

        res.status(200).json({
            message: 'Delivery agent logged in successfully',
            token,
            agent
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in delivery agent' });
    }
};

//get delivery agent profile
export const getAgentProfile = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findById(req.user.id).select('-password');
        res.status(200).json({ agent });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching delivery agent profile' });
    }
}; 

//update delivery agent status
export const updateAgentProfile = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findById(req.user.id);

        agent.name = req.body.name || agent.name;
        agent.phone = req.body.phone || agent.phone;
        agent.status = req.body.status || agent.status;

        await agent.save();

        res.json({ message: 'Profile updated successfully', agent });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
};

//update delivery agent location
export const updateAgentLocation = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findById(req.user.id);

        const { lat, lng } = req.body;

        agent.location = { lat , lng };
        await agent.save();

        res.json ({ message: 'Location updated successfully', agent });
    } catch (error) {
        res.status(500).json({ message: 'Error updating location' });
    }
};