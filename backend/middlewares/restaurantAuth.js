import jwt from 'jsonwebtoken';
import Restaurant from '../models/restaurantModel.js';

export const protectRestaurant = async (req, res, next) => {
    try{
        let token= req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({message: "Not authorized, no token"});
        }

        const decoded= jwt.verify(token, process.env.JWT_SECRET);

        req.user = { id: decoded.id, role: 'restaurant' };
        req.restaurant = restaurant;

        const restaurant= await Restaurant.findById(decoded.id);
        if(!restaurant){
            return res.status(401).json({message: "Not authorized, restaurant not found"});
        }

        next();
    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" }); 
    }
};