// ========================================================
// File: backend/config/db.js
// Purpose: MongoDB Connection supporting both Local & Cloud Atlas URIs
// ========================================================
import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
    const conn = await mongoose.connect(mongoUri, {
      dbName: DB_NAME,
    });
    console.log(` MongoDB connected successfully! Host: ${conn.connection.host} | DB: ${DB_NAME}`);
  } catch (error) {
    console.error(" MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
