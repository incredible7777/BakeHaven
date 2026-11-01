import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";
// Load environment variables from .env
dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and then start the Express server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(` 🎂 BakeHaven Server running on: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("!!!! MongoDB connection failed:", err);
  });