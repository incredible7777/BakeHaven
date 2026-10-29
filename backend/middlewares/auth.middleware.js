// Purpose: Protect Private Routes using JWT Verification
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";


 //verifyJWT
 //Extracts token from Authorization header or cookies,
 //verifies signature, and attaches user to req.user.
 
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Step 1: Extract Bearer token from headers
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized request: Please login first");
    }

    // Step 2: Verify token signature
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Step 3: Fetch user from DB (excluding password)
    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User does not exist");
    }

    // Step 4: Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid or expired token");
  }
});