import { Router } from "express";
import {
    createOrder,
    getUserOrders,
    updateOrderItemQuantity,
    removeOrder,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all order routes with JWT verification
router.use(verifyJWT);

// Create order / View user order history
router.route("/").post(createOrder).get(getUserOrders);

// Update quantity of a cake in an order
router.route("/:orderId/item").put(updateOrderItemQuantity);

// Cancel/Delete an order
router.route("/:orderId").delete(removeOrder);

export default router;
