// Purpose: Express Application Setup & Route Declarations

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

// Trust reverse proxy for HTTPS termination (Render, Railway, Heroku, AWS)
app.set("trust proxy", 1);

// 1. Dynamic CORS Configuration
// Automatically allows your main production URL, localhost, and Vercel/Netlify preview branches
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow if explicit match OR if deployed on any *.vercel.app or *.netlify.app domain
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /\.netlify\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocked request from origin: ${origin}`));
      }
    },
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
