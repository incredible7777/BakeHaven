// Purpose: Authentication Controller (Signup, Login, Profile)
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

// Cookie security options (httpOnly prevents client-side JS theft via XSS)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",


};


 // Helper function to generate both Access & Refresh tokens,
 //  and persist the refresh token in the MongoDB user document.
 
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // Save refresh token to user in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

// registerUser: Handles new user signup, validation, and cookie-based token assignment.

export const registerUser= asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Step 1: Validate input presence
  if (!name || !email || !password) {
    throw new ApiError(400, "All fields (name, email, password) are required");
  }

  // Step 2: Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Step 3: Create user in database (password is hashed automatically by pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
  });

  // Step 4: Generate signed tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  // Step 5: Remove password field before returning user object
  const createdUser = await User.findById(user._id).select("-password");

  // Step 6: Return standard ApiResponse with tokens in response body
  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, accessToken, refreshToken },
        "User registered successfully"
      )
    );
});

// loginUser: Handles login for existing users and sets secure httpOnly cookies.

export const loginUser= asyncHandler(async (req, res) => {
  const {email,password}=req.body;

  // Step 1: Validate input presence
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Step 2: Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist. Please sign up.");
  }

  // Step 3: Verify password using custom method on User model
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password credentials");
  }

  // Step 4: Generate JWT token
  const { accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
  // Step 5: Retrieve user without password
  const loggedInUser = await User.findById(user._id).select("-password");

  // Step 6: Return standard ApiResponse
 return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Logged in successfully"
      )
    );
});

// logoutUser: Clears JWT cookies and removes refresh token from DB
export const logoutUser = asyncHandler(async (req, res) => {
  // Clear refresh token from MongoDB
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }, // Removes the field from MongoDB
    },
    { new: true }
  );
  // Clear HTTP cookies
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// refreshAccessToken: Generates a new access token using the refresh token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: No refresh token provided");
  }
  try {
    // Verify signature of refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token: User not found");
    }
    // Verify token matches what is stored in DB
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or has been used");
    }
    // Generate fresh tokens
    const { accessToken,refreshToken:newRefreshToken }=await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
// getUserProfile: Retrieves current logged-in user details via verifyJWT middleware.
export const getUserProfile= asyncHandler(async (req, res) => {
  // req.user was attached by verifyJWT middleware
  return res.status(200).json(
    new ApiResponse(
      200,
      { user: req.user },
      "User profile fetched successfully"
    )
  );
});