"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import StarRating from "./StarRating";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  if (!product) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-gray-50 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none flex items-center justify-center p-10 min-h-[280px]">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain p-10"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Info Section */}
          <div className="p-7 flex flex-col gap-4">
            {/* Category badge */}
            <span className="self-start bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full capitalize">
              {product.category}
            </span>

            <h2 className="text-xl font-bold text-gray-900 leading-snug">
              {product.title}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating rate={product.rating.rate} />
              <span className="text-sm text-gray-500">
                ({product.rating.count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-600">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-auto flex flex-col gap-2 pt-2">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-2xl transition-colors">
                Add to Cart
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-2xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
