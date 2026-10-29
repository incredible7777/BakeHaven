import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  updateWishlistQuantity,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all wishlist routes with JWT verification
router.use(verifyJWT);

// Add item to wishlist / Get all wishlist items
router.route("/").post(addToWishlist).get(getWishlist);

// Update quantity of an item in the wishlist
router.route("/quantity").put(updateWishlistQuantity);

// Remove item from wishlist by cake name
router.route("/:itemName").delete(removeFromWishlist);
export default router;