import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

export const protectAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        } 

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({ message: 'Not authorized, admin not found' });
        }

        req.user = { id: admin._id, role: 'admin' }; 
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};