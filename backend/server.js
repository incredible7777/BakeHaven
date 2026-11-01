import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";
import { Product } from "./models/product.model.js";
import { products } from "./data/productsSeed.js";

// Load environment variables from .env
dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and then start the Express server
connectDB()
  .then(async () => {
    // Auto-seed cakes if database is brand new / empty
    try {
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log(" Fresh database detected. Auto-seeding 12 BakeHaven cakes...");
        await Product.insertMany(products);
        console.log(" Auto-seed complete: 12 cakes loaded into database!");
      }
    } catch (seedErr) {
      console.warn("Auto-seed check note:", seedErr.message);
    }

    app.listen(PORT, () => {
      console.log(` 🎂 BakeHaven Server running on: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("!!!! MongoDB connection failed:", err);
  });
