import jwt from 'jsonwebtoken';
import DeliveryAgent from '../models/deliveryAgentModel.js';

export const protectAgent = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = { id : decoded.id, role: 'agent' };

        //fetch agent
        const agent = await DeliveryAgent.findById(decoded.id);
        if (!agent) {
            return res.status(401).json({ message: 'Agent not found, authorization denied' });
        }

        if( agent.status === 'blocked' ) {
            return res.status(403).json({ message: 'Agent is blocked by Admin' });
        }

        req.agent = agent;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

