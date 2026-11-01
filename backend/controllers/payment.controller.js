import crypto from "crypto";
import Razorpay from "razorpay";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper: Connect to Razorpay using your .env keys
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};
    
// JOB 1: Create Order
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  // 1. Fetch order from MongoDB
  const order = await Order.findOne({ _id: orderId, userId: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");

  // 2. Razorpay expects amounts in PAISE (1 Rupee = 100 paise)
  // Example: RS 1500 becomes 150000 paise
  const amountInPaise = Math.round(order.totalAmount * 100);

  const rzp = getRazorpayInstance();

  // 3. Request Razorpay to create an official order
  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: `order_${String(order._id).slice(-8)}`,
  };

  const razorpayOrder = await rzp.orders.create(options);

  // 4. Save the razorpay_order_id in our database
  order.paymentInfo.razorpayOrderId = razorpayOrder.id;
  await order.save();

  // 5. Send order ID and public key back to the React frontend
  return res.status(200).json(
    new ApiResponse(200, {
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    }, "Razorpay order initialized successfully")
  );
});

// JOB 2: Verify Payment Signature

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const order = await Order.findOne({ _id: orderId, userId: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");

  // SECURITY CHECK:
  // We combine razorpayOrderId and razorpayPaymentId separated by a pipe "|"
  const dataToHash = `${razorpayOrderId}|${razorpayPaymentId}`;

  // We hash it using our secret key with HMAC-SHA256 algorithm
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(dataToHash)
    .digest("hex");

  // Compare our calculated hash with the signature Razorpay sent
  if (expectedSignature !== razorpaySignature) {
    order.paymentInfo.status = "Failed";
    await order.save();
    throw new ApiError(400, "Tampering detected: Invalid payment signature!");
  }

  // Payment is 100% verified! Update order status to Paid
  order.status = "Confirmed";
  order.paymentInfo.status = "Paid";
  order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
  order.paymentInfo.razorpaySignature = razorpaySignature;
  order.paymentInfo.paidAt = new Date();
  await order.save();

  return res.status(200).json(
    new ApiResponse(200, order, "Payment verified successfully!")
  );
});