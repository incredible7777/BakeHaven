import {Router} from "express";
import {
    getAllProducts,
    getProductById,
} from "../controllers/products.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//Public routes
router.route("/").get(getAllProducts);
router.route("/:id").get(getProductById);

export default router;
