// Purpose: Categorized Cake Display Grids

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/slices/productSlice";
import ProductCard from "./ProductCard";

const ProductSection = ({ selectedCategory, onQuickView, onOpenAuth }) => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading && products.length === 0) {
    return (
      <div className="py-20 text-center font-uchen text-[#a16d0e] text-xl">
        Baking fresh cakes from database...
      </div>
    );
  }

  // Filter products if a specific category was picked from Navbar
  const displayProducts = selectedCategory
    ? products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase())
    : products;

  // Split products for the authentic original layout
  const cakes = displayProducts.filter((p) => p.category === "Cakes" || !p.category);
  const birthdayCakes = displayProducts.filter((p) => p.category === "Birthday Cake");
  const otherCakes = displayProducts.filter((p) => p.category !== "Cakes" && p.category !== "Birthday Cake");

  return (
    <section id="product-cards" className="max-w-7xl mx-auto px-4 mt-16 font-uchen">
      {/* SECTION 1: CAKES */}
      {(cakes.length > 0 || selectedCategory) && (
        <div data-aos="fade-up" data-aos-duration="1500" className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-10 tracking-widest">
            {selectedCategory ? selectedCategory.toUpperCase() : "CAKES"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(selectedCategory ? displayProducts : cakes).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={onQuickView}
                onOpenAuth={onOpenAuth}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: BIRTHDAY CAKES (Shown when viewing all) */}
      {!selectedCategory && birthdayCakes.length > 0 && (
        <div data-aos="fade-up" data-aos-duration="1500" className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-10 tracking-widest">
            BIRTHDAY CAKE
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {birthdayCakes.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={onQuickView}
                onOpenAuth={onOpenAuth}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: OTHER CATEGORIES */}
      {!selectedCategory && otherCakes.length > 0 && (
        <div data-aos="fade-up" data-aos-duration="1500" className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-10 tracking-widest">
            MORE TREATS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherCakes.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={onQuickView}
                onOpenAuth={onOpenAuth}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductSection;