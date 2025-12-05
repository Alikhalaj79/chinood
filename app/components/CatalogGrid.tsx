"use client";

import React, { useEffect, useState, useMemo } from "react";
import type { CatalogDTO } from "../lib/types";
import CatalogCard from "./CatalogCard";
import CatalogCardSkeleton, {
  CatalogCardSkeletonHorizontal,
} from "./CatalogCardSkeleton";
import Pagination from "./admin/Pagination";

export default function CatalogGrid() {
  const [items, setItems] = useState<CatalogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardDirection, setCardDirection] = useState<"top-to-bottom" | "bottom-to-top">("top-to-bottom");
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setCardDirection(data.cardDirection || "top-to-bottom");
          if (data.itemsPerPage) {
            setItemsPerPage(data.itemsPerPage);
          }
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    
    // Fetch settings on mount
    fetchSettings();
    
    // Use BroadcastChannel for real-time settings updates
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("settings-updates");
      channel.onmessage = (event) => {
        if (event.data.type === "settings-updated") {
          fetchSettings();
        }
      };
    }
    
    // Refresh settings when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSettings();
      }
    };
    
    // Refresh settings when window gains focus
    const handleFocus = () => {
      fetchSettings();
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    
    // Polling: Check for settings updates every 3 seconds as fallback
    const intervalId = setInterval(fetchSettings, 3000);
    
    return () => {
      if (channel) {
        channel.close();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      clearInterval(intervalId);
    };
  }, []);

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

  // Apply card direction - must be before any conditional returns
  const displayedItems = useMemo(() => {
    const sorted = cardDirection === "bottom-to-top" ? [...items].reverse() : items;
    return sorted;
  }, [items, cardDirection]);

  // Pagination logic - must be before any conditional returns
  const totalPages = Math.ceil(displayedItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayedItems.slice(startIndex, endIndex);
  }, [displayedItems, currentPage, itemsPerPage]);

  // Reset to page 1 if current page is out of bounds or itemsPerPage changes - must be before any conditional returns
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, displayedItems.length]);

  // Reset to page 1 when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const getImageUrl = (item: CatalogDTO) => {
    if (item.image) {
      if (item.imageMimeType) {
        return `data:${item.imageMimeType};base64,${item.image}`;
      }
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
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full gap-8 md:gap-12">
        {paginatedItems.map((item, index) => (
          <div
            key={item.id}
            className="w-full animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CatalogCard item={item} getImageUrl={getImageUrl} />
          </div>
        ))}
      </div>
      {displayedItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={displayedItems.length}
        />
      )}
    </div>
  );
}
