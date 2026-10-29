import {Router} from "express"
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUserProfile,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

//Secure routes( after verifyJWT apply )
router.route("/logout").post(verifyJWT,logoutUser); 
router.route("/profile").get(verifyJWT,getUserProfile);


export default router;