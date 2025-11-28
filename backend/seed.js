import mongoose from "mongoose";
import dotenv from "dotenv";

import Restaurant from "./models/restaurantModel.js";
import Menu from "./models/menuModel.js";

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

async function seed() {
    try {
        // Clear existing data
        await Restaurant.deleteMany({});
        await Menu.deleteMany({});

        const restaurant = await Restaurant.create({
            name: "Pizza Palace",
            email: "contact@pizzapalace.com",
            password: "securepassword",
            phone: "123-456-7890",
            address: "123 Pizza St, Flavor Town",
            Image: "https://example.com/pizza-palace.jpg",
        });

        const menuItems = [
            {
                restaurantId: restaurant._id,
                name: "Margherita Pizza",
                description: "Classic pizza with fresh tomatoes, mozzarella cheese, and basil.",
                price: 12.99,
                category: "Pizza",
                image: "https://example.com/margherita.jpg",
            },
            {
                restaurantId: restaurant._id,
                name: "Pepperoni Pizza",
                description: "Spicy pepperoni with mozzarella cheese and tomato sauce.",
                price: 14.99,
                category: "Pizza",
                image: "https://example.com/pepperoni.jpg",
            },
            {
                restaurantId: restaurant._id,
                name: "Caesar Salad",
                description: "Crisp romaine lettuce with Caesar dressing, croutons, and Parmesan cheese.",
                price: 9.99,
                category: "Salad",
                image: "https://example.com/caesar-salad.jpg",
            },
        ];

        const inserted = await Menu.insertMany(menuItems);

        console.log("seed completed");
        console.log("Restaurant:", restaurant._id);
        console.log("Menu Items:", inserted.map(i => i._id));

        process.exit();
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seed();