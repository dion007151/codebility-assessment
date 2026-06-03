"use client";

import { Category } from "@/types/product";

interface FilterBarProps {
  categories: Category[];
  selected: Category;
  onSelect: (category: Category) => void;
  sortBy: string;
  onSortChange: (sort: "default" | "price-asc" | "price-desc" | "rating") => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  electronics: "Electronics",
  jewelery: "Jewelry",
  "men's clothing": "Men's",
  "women's clothing": "Women's",
};

export default function FilterBar({ categories, selected, onSelect, sortBy, onSortChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              selected === cat
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="ml-auto">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "default" | "price-asc" | "price-desc" | "rating")}
          className="text-sm bg-white border border-gray-200 text-gray-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
        >
          <option value="default">Default Sort</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>
  );
}
