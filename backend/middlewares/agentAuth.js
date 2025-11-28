import jwt from 'jsonwebtoken';
import DeliveryAgent from '../models/deliveryAgentModel.js';

export const protectAgent = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, role: 'agent' };
        req.agent = agent;

        const agent = await DeliveryAgent.findById(decoded.id);
        if (!agent) {
            return res.status(401).json({ message: 'Not authorized, agent not found' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error });
    }
};

