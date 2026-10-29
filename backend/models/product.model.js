
// Cake Product Schema for Catalog

import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Cake name is required"],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Cakes",
        "Birthday Cake",
        "Cup Cake",
        "Slice Cake",
        "Chocolate Cake",
        "Party Cake",
      ],
      default: "Cakes",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      default: 0,
    },
    image: {
      type: String,
      required: [true, "Cake image path is required"],
    },
    quote: {
      type: String,
      default: "Cake is not just a food, it's an emotion.",
    },
    description: {
      type: String,
      default: "Delicious freshly baked artisanal cake made with premium ingredients.",
    },
    stars: {
      type: Number,
      default: 4,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);