// Purpose: Fetch and Filter Cakes for the Storefront
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

//purpose: get all cakes or filter by category using query param
export const getAllProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;

  // Filter by category if supplied; otherwise fetch all
  const filter = category?{ category } : {};
  const products = await Product.find(filter).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

//purpose: get product by id using params
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product details fetched successfully"));
});