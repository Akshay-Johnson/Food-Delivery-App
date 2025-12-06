import Restaurant from '../models/restaurantModel.js';
import Menu from '../models/menuModel.js';

//search all 
export const searchAll = async (req, res) => {
    try {
        const query = req.query.q || '';
        if (!query,trim()) {
            return res.json({ restaurants: [], dishes: [] });
        }
        
        const searchRegex = new RegExp(query, 'i');

        //search restaurants 
        const restaurants = await Restaurant.find({
            name: { $regex: searchRegex },
        });

        //search dishes
        const dishes = await Menu.find({
            name: { $regex: searchRegex },
        });

        res.json({ restaurants, dishes });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};