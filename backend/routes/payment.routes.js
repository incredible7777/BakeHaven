import { Router } from "express";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all payment endpoints with JWT verification
router.use(verifyJWT);

// Create Razorpay order
router.route("/create-order").post(createPaymentOrder);

// Verify payment signature
router.route("/verify").post(verifyPayment);

export default router;
