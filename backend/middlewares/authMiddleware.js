import jwt from 'jsonwebtoken';
import Customer from '../models/customerModel.js';

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id };
        next();

    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export default auth;