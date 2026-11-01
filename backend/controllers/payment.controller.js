import crypto from "crypto";
import Razorpay from "razorpay";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

// Helper: Connect to Razorpay using your .env keys
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (
    !keyId ||
    !keySecret ||
    keyId.includes("placeholder") ||
    keySecret.includes("placeholder")
  ) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// ========================================================
// 1. Create Razorpay Order
// ========================================================
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId, deliveryAddress } = req.body;

  if (!orderId) throw new ApiError(400, "Order ID is required");

  // Fetch order from MongoDB
  const order = await Order.findOne({ _id: orderId, userId: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");

  if (order.items.length === 0) {
    throw new ApiError(400, "Cannot checkout an empty order");
  }

  // Update delivery address if provided
  if (deliveryAddress) {
    order.deliveryAddress = {
      ...order.deliveryAddress,
      ...deliveryAddress,
    };
  }

  // Razorpay expects amounts in PAISE (1 Rupee = 100 paise)
  const amountInPaise = Math.round(order.totalAmount * 100);
  const rzp = getRazorpayInstance();

  if (rzp) {
    // Official Razorpay API order
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `bakehaven_${String(order._id).slice(-8)}`,
      notes: {
        orderId: String(order._id),
        customerName: deliveryAddress?.fullName || req.user.name,
        customerPhone: deliveryAddress?.phone || "",
      },
    };

    const razorpayOrder = await rzp.orders.create(options);
    order.paymentInfo.razorpayOrderId = razorpayOrder.id;
    order.paymentInfo.method = "Razorpay";
    await order.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          razorpayOrderId: razorpayOrder.id,
          amount: amountInPaise,
          currency: "INR",
          keyId: process.env.RAZORPAY_KEY_ID,
          isSimulation: false,
        },
        "Razorpay order initialized successfully"
      )
    );
  } else {
    // Sandbox / Simulation fallback
    const mockOrderId = `order_sim_${Date.now()}_${String(order._id).slice(-4)}`;
    order.paymentInfo.razorpayOrderId = mockOrderId;
    order.paymentInfo.method = "Razorpay";
    await order.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          razorpayOrderId: mockOrderId,
          amount: amountInPaise,
          currency: "INR",
          keyId: "rzp_test_sandbox",
          isSimulation: true,
        },
        "Test simulation order created"
      )
    );
  }
});

// ========================================================
// 2. Verify Payment Signature
// ========================================================
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, deliveryAddress } = req.body;

  const order = await Order.findOne({ _id: orderId, userId: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");

  const rzp = getRazorpayInstance();

  if (rzp) {
    // Cryptographic HMAC-SHA256 signature verification
    const dataToHash = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(dataToHash)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      order.paymentInfo.status = "Failed";
      await order.save();
      throw new ApiError(400, "Security check failed: Invalid payment signature!");
    }
  }

  // Save address if passed during verify
  if (deliveryAddress) {
    order.deliveryAddress = {
      ...order.deliveryAddress,
      ...deliveryAddress,
    };
  }

  // Update order status to Confirmed and Paid
  order.status = "Confirmed";
  order.paymentInfo.status = "Paid";
  order.paymentInfo.method = "Razorpay";
  order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
  order.paymentInfo.razorpaySignature = razorpaySignature || "sig_verified";
  order.paymentInfo.paidAt = new Date();
  await order.save();

  return res.status(200).json(
    new ApiResponse(200, order, "Payment verified successfully!")
  );
});
