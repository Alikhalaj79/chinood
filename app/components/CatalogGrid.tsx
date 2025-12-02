"use client";

import React, { useEffect, useState } from "react";
import type { CatalogDTO } from "../lib/types";

export default function CatalogGrid() {
  const [items, setItems] = useState<CatalogDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/catalog");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to load catalog", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const getImageUrl = (item: CatalogDTO) => {
    if (item.image) {
      // If image is base64 string, create data URL
      if (item.imageMimeType) {
        return `data:${item.imageMimeType};base64,${item.image}`;
      }
      // Fallback: use API endpoint
      return `/api/images/${item.id}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-[#497321]">در حال بارگذاری...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        آیتمی یافت نشد.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {items.map((item) => {
        const imageUrl = getImageUrl(item);
        return (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-[#a3d177] hover:shadow-lg transition-shadow"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">بدون تصویر</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="text-xl font-bold text-[#253614] mb-2">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-gray-600 text-sm line-clamp-3">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
