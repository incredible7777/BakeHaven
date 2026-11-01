// Purpose: Express Application Setup & Route Declarations

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

// Trust reverse proxy for HTTPS termination (Render, Railway, Heroku, AWS)
app.set("trust proxy", 1);

// 1. CORS Configuration (Allows frontend React to connect securely with credentials)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// 2. Request Parsers with payload limits for security
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// 3. Static Assets serving
app.use(express.static("public"));

// 4. Cookie Parser (Reads httpOnly cookies for access/refresh tokens)
app.use(cookieParser());

// Import & Mount Routes
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import contactRouter from "./routes/contact.routes.js";
import paymentRouter from "./routes/payment.routes.js";

// Mount API endpoints
app.use("/api/auth", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/contact", contactRouter);
app.use("/api/payment", paymentRouter);

// Error Handler
// 404 Handler for undefined routes
app.use(notFoundHandler);
// Centralized Error Handling Middleware (Catches all ApiErrors)
app.use(errorHandler);

export { app };
