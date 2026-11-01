// Purpose: Order Schema for Cart, Purchases, Payments & Invoices
import mongoose, { Schema } from "mongoose";

// Snapshot of item inside the order
const orderItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  image: {
    type: String,
    default: "/image/c1.png",
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
});

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ["Razorpay", "COD"],
        default: "Razorpay",
      },
      status: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending",
      },
      razorpayOrderId: { type: String, default: "" },
      razorpayPaymentId: { type: String, default: "" },
      razorpaySignature: { type: String, default: "" },
      paidAt: { type: Date },
    },
    deliveryAddress: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
      deliveryDate: { type: String, default: "" },
      customNote: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
