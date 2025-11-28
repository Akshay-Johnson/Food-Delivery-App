import Cart from '../models/cartModel.js';

//calculate total price
const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

//add item to cart
export const addToCart = async (req, res) => {
    try{
        const customerId = req.user.id;
        const { itemId , name, price, quantity } = req.body;

        let cart = await Cart.findOne({ customerId });

        if(!cart){
            cart = await Cart.create({ 
            customerId, 
            items: [{ itemId, name, price, quantity }] ,
            totalPrice: price * quantity
        });
        return res.status(201).json(cart);
        }
        const existingItem = cart.items.find(i => i.itemId.toString() === itemId);

        if(existingItem){
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ itemId, name, price, quantity });
        }

        cart.totalPrice = calculateTotal(cart.items);
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error: error.message });    
    }
};

//update item quantity 
export const updateCartItem = async (req, res) => {
    try{
        const customerId = req.user.id; 
        const { quantity } = req.body;
        const { itemId} = req.params;

        let cart = await Cart.findOne({ customerId });
        if(!cart){
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(i => i.itemId.toString() === itemId);
        if(!item){
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        item.quantity = quantity;

        cart.totalPrice = calculateTotal(cart.items);
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart item', error: error.message });    
    }
};

//remove item from cart
export const removeCartItem = async (req, res) => {
    try{
        const customerId = req.user.id; 
        const { itemId} = req.params;

        let cart = await Cart.findOne({ customerId });
        if(!cart){
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(i => i.itemId.toString() !== itemId);

        cart.totalPrice = calculateTotal(cart.items);
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing cart item', error: error.message });    
    }
};

//get cart by customer ID
export const getCart = async (req, res) => {
    try{
        const customerId = req.user.id;
        const cart = await Cart.findOne({ customerId });

        if(!cart){
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error: error.message });    
    }
};

//clear cart
export const clearCart = async (req, res) => {
    try{
        const customerId = req.user.id;
        const cart = await Cart.findOne({ customerId });

        if(!cart){
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart', error: error.message });    
    }
};