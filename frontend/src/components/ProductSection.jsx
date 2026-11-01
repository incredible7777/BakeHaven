// ========================================================
// File: frontend/src/components/ProductSection.jsx
// Purpose: Categorized Cake Display Grids with Smart Search, Filter Chips & Uniform Alignment
// ========================================================
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/slices/productSlice";
import ProductCard from "./ProductCard";

const ProductSection = ({ selectedCategory, onSelectCategory, onQuickView, onOpenAuth }) => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading && products.length === 0) {
    return (
      <div className="py-24 text-center font-uchen text-[#a16d0e] text-xl animate-pulse">
        Baking fresh cakes from database...
      </div>
    );
  }

  // Smart filter: Matches category name, title, description, or quote
  const displayProducts = selectedCategory
    ? products.filter((p) => {
        const cat = selectedCategory.toLowerCase();
        const keyword = cat.replace(" cake", "").trim();

        // 1. Direct category match
        if (p.category && p.category.toLowerCase().includes(keyword)) return true;

        // 2. Direct name match
        if (p.name && p.name.toLowerCase().includes(keyword)) return true;

        // 3. Description & quote match
        if (p.description && p.description.toLowerCase().includes(keyword)) return true;
        if (p.quote && p.quote.toLowerCase().includes(keyword)) return true;

        // 4. Special category mappings:
        // "Party Cake": includes party & celebration cakes
        if (keyword === "party") {
          return (
            (p.name && (p.name.includes("Celebration") || p.name.includes("Cream") || p.name.includes("Deluxe"))) ||
            (p.description && (p.description.toLowerCase().includes("party") || p.description.toLowerCase().includes("celebrat"))) ||
            (p.quote && p.quote.toLowerCase().includes("party"))
          );
        }

        // "Chocolate Cake": includes "choco"
        if (keyword === "chocolate") {
          return (
            (p.name && p.name.toLowerCase().includes("choco")) ||
            (p.description && p.description.toLowerCase().includes("choco"))
          );
        }

        return false;
      })
    : products;

  // Split products for the authentic original layout
  const cakes = displayProducts.filter((p) => p.category === "Cakes" || !p.category);
  const birthdayCakes = displayProducts.filter((p) => p.category === "Birthday Cake");
  const otherCakes = displayProducts.filter(
    (p) => p.category !== "Cakes" && p.category !== "Birthday Cake"
  );

  return (
    <section id="product-cards" className="max-w-7xl mx-auto px-4 mt-20 font-uchen">
      {/* Category Filter Active Pill */}
      {selectedCategory && (
        <div className="flex items-center justify-center space-x-3 mb-8" data-aos="fade-down">
          <span className="text-sm text-[#f8e7d2] font-semibold">Filtering by:</span>
          <span className="inline-flex items-center space-x-2 bg-[#a16d0e] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
            <span>{selectedCategory}</span>
            <button
              onClick={() => onSelectCategory && onSelectCategory("")}
              className="hover:text-black font-extrabold text-base focus:outline-none"
              title="Clear Filter"
            >
              &times;
            </button>
          </span>
          <button
            onClick={() => onSelectCategory && onSelectCategory("")}
            className="text-xs text-[#a16d0e] hover:text-white underline font-bold transition"
          >
            Show All Cakes
          </button>
        </div>
      )}

      {/* SECTION 1: CAKES / FILTERED CATEGORY */}
      {(cakes.length > 0 || selectedCategory) && (
        <div data-aos="fade-up" data-aos-duration="1500" className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-12 tracking-widest uppercase">
            {selectedCategory ? selectedCategory : "CAKES"}
          </h2>
          {displayProducts.length === 0 ? (
            <div className="text-center py-12 text-[#e2b58d] text-base">
              No cakes found in this category.
              <button
                onClick={() => onSelectCategory && onSelectCategory("")}
                className="ml-2 text-white underline font-bold"
              >
                View all cakes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 items-stretch">
              {(selectedCategory ? displayProducts : cakes).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={onQuickView}
                  onOpenAuth={onOpenAuth}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: BIRTHDAY CAKES (Shown when viewing all) */}
      {!selectedCategory && birthdayCakes.length > 0 && (
        <div data-aos="fade-up" data-aos-duration="1500" className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-12 tracking-widest uppercase">
            BIRTHDAY CAKE
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 items-stretch">
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
        <div data-aos="fade-up" data-aos-duration="1500" className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-12 tracking-widest uppercase">
            MORE TREATS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 items-stretch">
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
