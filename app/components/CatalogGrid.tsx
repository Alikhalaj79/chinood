"use client";

import React, { useEffect, useState } from "react";
import type { CatalogDTO } from "../lib/types";
import CatalogCard from "./CatalogCard";
import CatalogCardSkeleton, {
  CatalogCardSkeletonHorizontal,
} from "./CatalogCardSkeleton";

export default function CatalogGrid() {
  const [items, setItems] = useState<CatalogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/catalog");
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "خطا در بارگذاری کاتالوگ");
        }
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to load catalog", err);
        setError(
          err instanceof Error
            ? err.message
            : "خطایی در بارگذاری کاتالوگ رخ داد. لطفاً دوباره تلاش کنید."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const getImageUrl = (item: CatalogDTO) => {
    // Always use the images endpoint for better performance
    // The catalog API no longer includes base64 image data
    if (item.imageMimeType) {
      return `/api/images/${item.id}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full gap-8">
        {[1, 2, 3].map((i) => (
          <CatalogCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl md:text-2xl font-bold text-[#253614] mb-2">
          خطا در بارگذاری
        </h2>
        <p className="text-gray-600 text-center mb-6 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#497321] hover:bg-[#253614] text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl md:text-2xl font-bold text-[#253614] mb-2">
          هیچ آیتمی وجود ندارد
        </h2>
        <p className="text-gray-600 text-center max-w-md">
          در حال حاضر هیچ کاردی در کاتالوگ موجود نیست.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-8 md:gap-12">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="w-full animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CatalogCard item={item} getImageUrl={getImageUrl} />
        </div>
      ))}
    </div>
  );
}
