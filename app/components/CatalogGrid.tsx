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

  if (loading) return <div>Loading...</div>;
  if (items.length === 0) return <div>No items found.</div>;

  return (
    <div className="catalog-grid grid grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.id} className="p-3 border rounded">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200" />
          )}
          <h3 className="mt-2 font-semibold">{item.title}</h3>
          <p className="text-sm text-gray-600">${item.price}</p>
        </div>
      ))}
    </div>
  );
}
