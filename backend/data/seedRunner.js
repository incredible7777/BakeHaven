// Purpose: Populate MongoDB with the 12 Original Cakes
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/product.model.js";
import { products } from "./productsSeed.js";
import { DB_NAME } from "../constant.js";

// Load environment variables from .env
dotenv.config();

const seedDatabase = async () => {
  try {
    // Step 1: Connect to MongoDB
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(" MongoDB Connected!");

    // Step 2: Delete existing products to avoid duplicates
    await Product.deleteMany();
    console.log("Cleared existing cake products.");

    // Step 3: Insert the original 12 cakes
    await Product.insertMany(products);
    console.log(" Successfully seeded all 12 Cakes into MongoDB!");

    // Terminate script successfully
    process.exit(0);
  } catch (error) {
    console.error(" Seeding Error:", error.message);
    process.exit(1);
  }
};

seedDatabase();