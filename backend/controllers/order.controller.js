// Purpose: Order & Cart Logic (Create, Consolidate, List, Update, Checkout, Cancel)
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

//purpose: Add item to cart / create or update pending order
export const createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;

  // Step 1: Validate items array
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Order must contain at least one cake item");
  }

  // Step 2: Check if user already has an active Pending order (cart)
  let activeOrder = await Order.findOne({
    userId: req.user._id,
    status: "Pending",
  }).sort({ createdAt: -1 });

  // Consolidate any duplicate Pending orders from prior operations
  const otherPendingOrders = await Order.find({
    userId: req.user._id,
    status: "Pending",
    _id: { $ne: activeOrder?._id },
  });

  if (otherPendingOrders.length > 0 && activeOrder) {
    for (const oldOrder of otherPendingOrders) {
      for (const oldItem of oldOrder.items) {
        const existingInActive = activeOrder.items.find(
          (i) => i.name.toLowerCase() === oldItem.name.toLowerCase()
        );
        if (existingInActive) {
          existingInActive.quantity += (oldItem.quantity || 1);
        } else {
          activeOrder.items.push(oldItem);
        }
      }
      await Order.findByIdAndDelete(oldOrder._id);
    }
  }

  // Step 3: If an active pending order exists, merge incoming items into it
  if (activeOrder) {
    for (const incomingItem of items) {
      const existingItem = activeOrder.items.find(
        (i) => i.name.toLowerCase() === incomingItem.name.toLowerCase()
      );

      if (existingItem) {
        // Increment count instead of creating another instance!
        existingItem.quantity += (incomingItem.quantity || 1);
      } else {
        // Add new cake to existing order
        activeOrder.items.push({
          name: incomingItem.name,
          price: incomingItem.price || 0,
          image: incomingItem.image || "/image/c1.png",
          quantity: incomingItem.quantity || 1,
        });
      }
    }

    // Recalculate total amount
    activeOrder.totalAmount = activeOrder.items.reduce(
      (acc, curr) => acc + (curr.price || 0) * (curr.quantity || 1),
      0
    );

    await activeOrder.save();

    return res
      .status(200)
      .json(new ApiResponse(200, activeOrder, "Item quantity updated in your cart!"));
  } else {
    // Step 4: No active pending order, create a fresh one
    const totalAmount = items.reduce((acc, item) => {
      return acc + (item.price || 0) * (item.quantity || 1);
    }, 0);

    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount,
      status: "Pending",
    });

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Item added to cart successfully!"));
  }
});

//purpose : get all orders for the currently authenticated user
export const getUserOrders = asyncHandler(async (req, res) => {
  // Consolidate any duplicate Pending orders into a single active order
  const pendingOrders = await Order.find({
    userId: req.user._id,
    status: "Pending",
  }).sort({ createdAt: -1 });

  if (pendingOrders.length > 1) {
    const mainOrder = pendingOrders[0];
    for (let i = 1; i < pendingOrders.length; i++) {
      const otherOrder = pendingOrders[i];
      for (const item of otherOrder.items) {
        const existing = mainOrder.items.find(
          (it) => it.name.toLowerCase() === item.name.toLowerCase()
        );
        if (existing) {
          existing.quantity += (item.quantity || 1);
        } else {
          mainOrder.items.push(item);
        }
      }
      await Order.findByIdAndDelete(otherOrder._id);
    }
    mainOrder.totalAmount = mainOrder.items.reduce(
      (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
      0
    );
    await mainOrder.save();
  }

  const orders = await Order.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

//purpose: update quantity of a specific cake inside an order
export const updateOrderItemQuantity = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { itemName, quantity } = req.body;

  if (!itemName || quantity === undefined || quantity < 1) {
    throw new ApiError(400, "Valid itemName and quantity (>= 1) are required");
  }

  const order = await Order.findOne({ _id: orderId, userId: req.user._id });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const item = order.items.find((i) => i.name === itemName);
  if (!item) {
    throw new ApiError(404, "Item not found in order");
  }

  // Update item quantity
  item.quantity = quantity;

  // Recalculate total amount
  order.totalAmount = order.items.reduce(
    (acc, curr) => acc + (curr.price || 0) * (curr.quantity || 1),
    0
  );

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order quantity updated successfully"));
});

//purpose: complete/checkout an order
export const checkoutOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({ _id: orderId, userId: req.user._id });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.status = "Completed";
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order completed successfully!"));
});

//purpose: remove or cancel an order
export const removeOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOneAndDelete({
    _id: orderId,
    userId: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found or unauthorized to delete");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order removed successfully"));
});
