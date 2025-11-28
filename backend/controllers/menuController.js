import Menu from '../models/menuModel.js';

//add menu item
export const addMenuItem = async (req, res) => {
    try {
        const restaurantId = req.user.id;
        const { name, description, price, category, image } = req.body;

        const item = await Menu.create({
            restaurantId,
            name,
            description,
            price,
            category,
            image,
        });

        res.status(201).json({
            message: 'Menu item added successfully',
            item,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding menu item', error: error.message });
    }
};

//update menu item
export const updateMenuItem = async (req, res) => {
    try {
        const restaurantId = req.user.id;
        const { id } = req.params;

        let item = await Menu.findOne({ _id: id, restaurantId });
        if (!item) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        item.name = req.body.name || item.name;
        item.description = req.body.description || item.description;
        item.price = req.body.price || item.price;
        item.category = req.body.category || item.category;
        item.image = req.body.image || item.image;

        await item.save();

        res.status(200).json({
            message: 'Menu item updated successfully',
            item,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error: error.message });
    }   
};

//delete menu item
export const deleteMenuItem = async (req, res) => { 
    try {
        const restaurantId = req.user.id;
        const { id } = req.params;

        const item = await Menu.findOneAndDelete({ _id: id, restaurantId });

        if (!item) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting menu item', error: error.message });
    }
};

//get menu items for a restaurant
export const getMyMenu = async (req, res) => {
    try {
        const restaurantId = req.user.id;
        const menu = await Menu.find({ restaurantId });
        
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }
};

//PUBLIC: get menu items of any restaurant
export const getMenuByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const menu = await Menu.find({ restaurantId });

        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }
};

//PUBLIC : get single menu item 
export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Menu.findById(id);

        if (!item) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu item', error: error.message });
    }
};