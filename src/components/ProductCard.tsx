"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import StarRating from "./StarRating";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      onClick={() => onClick(product)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative bg-gray-50 h-52 flex items-center justify-center p-6 overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4 gap-2">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
          {product.title}
        </h3>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex flex-col items-end gap-0.5">
            <StarRating rate={product.rating.rate} />
            <span className="text-xs text-gray-400">{product.rating.count} reviews</span>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onClick(product); }}
          className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
