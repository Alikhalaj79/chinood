"use client";

import React, { useState, useEffect } from "react";
import type { CatalogDTO } from "../lib/types";

interface CatalogCardProps {
  item: CatalogDTO;
  getImageUrl: (item: CatalogDTO) => string | null;
}

// Image skeleton component
function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse ${className || ""}`}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-12 h-12 text-gray-400 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-gray-400 text-xs">در حال بارگذاری تصویر...</span>
        </div>
      </div>
    </div>
  );
}

export default function CatalogCard({ item, getImageUrl }: CatalogCardProps) {
  const imageUrl = getImageUrl(item);
  const viewType = item.itemViewType || "type1";
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Reset loading state when imageUrl changes and check if image is already loaded
  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
      
      // Check if image is already loaded in browser cache
      const img = new Image();
      
      // Set up event handlers before setting src
      img.onload = () => {
        // Image is loaded (either from cache or network)
        setImageLoading(false);
        setImageError(false);
      };
      img.onerror = () => {
        setImageLoading(false);
        setImageError(true);
      };
      
      // Set src after handlers are set up
      img.src = imageUrl;
      
      // If image is already complete (cached), trigger onload immediately
      // This handles the case where image is already in browser cache
      if (img.complete && img.naturalWidth > 0) {
        setImageLoading(false);
        setImageError(false);
      }
    } else {
      setImageLoading(false);
      setImageError(false);
    }
  }, [imageUrl]);

  // Type 1: Image on top, title and description below
  if (viewType === "type1") {
    return (
      <div className="w-full shadow-sm">
        {imageUrl ? (
          <div className="w-full overflow-hidden relative">
            {imageLoading && (
              <div className="absolute inset-0 z-10">
                <ImageSkeleton className="w-full h-96 md:h-[450px] lg:h-[550px] rounded-lg" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={item.title}
              className={`w-full h-96 md:h-[450px] lg:h-[550px] object-cover hover:scale-105 transition-transform duration-500 rounded-lg ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              loading="lazy"
              onLoad={(e) => {
                // Check if image is actually loaded
                const img = e.currentTarget;
                if (img.complete && img.naturalWidth > 0) {
                  setImageLoading(false);
                  setImageError(false);
                }
              }}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            {imageError && (
              <div className="w-full h-96 md:h-[450px] lg:h-[550px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400 text-sm md:text-base">
                  خطا در بارگذاری تصویر
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-96 md:h-[450px] lg:h-[550px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
            <span className="text-gray-400 text-sm md:text-base">
              بدون تصویر
            </span>
          </div>
        )}
        <div className="px-4 md:px-6 py-5 md:py-6">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#253614] mb-3 md:mb-4">
            {item.title}
          </h3>
          {item.description && (
            <div className="text-gray-600 text-sm md:text-base leading-relaxed text-justify">
              {item.description.split('\n').map((paragraph, index) => (
                <p key={index} className={index > 0 ? 'mt-3' : ''}>
                  {paragraph || '\u00A0'}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Type 2: Text on left, image on right
  if (viewType === "type2") {
    return (
      <div className="w-full shadow-sm">
        <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="flex-1 px-4 md:px-6 py-5 md:py-6 w-full order-2 md:order-1">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#253614] mb-3 md:mb-4">
              {item.title}
            </h3>
            {item.description && (
              <div className="text-gray-600 text-sm md:text-base leading-relaxed text-justify">
                {item.description.split('\n').map((paragraph, index) => (
                  <p key={index} className={index > 0 ? 'mt-3' : ''}>
                    {paragraph || '\u00A0'}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 w-full md:w-auto order-1 md:order-2">
            {imageUrl ? (
              <div className="w-full overflow-hidden relative">
                {imageLoading && (
                  <div className="absolute inset-0 z-10">
                    <ImageSkeleton className="w-full h-64 md:h-80 lg:h-96 rounded-lg" />
                  </div>
                )}
                <img
                  src={imageUrl}
                  alt={item.title}
                  className={`w-full h-64 md:h-80 lg:h-96 object-cover hover:scale-105 transition-transform duration-500 rounded-lg ${
                    imageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  loading="lazy"
                  onLoad={(e) => {
                    // Check if image is actually loaded
                    const img = e.currentTarget;
                    if (img.complete && img.naturalWidth > 0) {
                      setImageLoading(false);
                      setImageError(false);
                    }
                  }}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
                {imageError && (
                  <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400 text-sm md:text-base">
                      خطا در بارگذاری تصویر
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400 text-sm md:text-base">
                  بدون تصویر
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Type 3: Image on left, text on right
  if (viewType === "type3") {
    return (
      <div className="w-full shadow-sm">
        <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="flex-1 w-full md:w-auto order-1">
            {imageUrl ? (
              <div className="w-full overflow-hidden relative">
                {imageLoading && (
                  <div className="absolute inset-0 z-10">
                    <ImageSkeleton className="w-full h-64 md:h-80 lg:h-96 rounded-lg" />
                  </div>
                )}
                <img
                  src={imageUrl}
                  alt={item.title}
                  className={`w-full h-64 md:h-80 lg:h-96 object-cover hover:scale-105 transition-transform duration-500 rounded-lg ${
                    imageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  loading="lazy"
                  onLoad={(e) => {
                    // Check if image is actually loaded
                    const img = e.currentTarget;
                    if (img.complete && img.naturalWidth > 0) {
                      setImageLoading(false);
                      setImageError(false);
                    }
                  }}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
                {imageError && (
                  <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400 text-sm md:text-base">
                      خطا در بارگذاری تصویر
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400 text-sm md:text-base">
                  بدون تصویر
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 px-4 md:px-6 py-5 md:py-6 w-full order-2">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#253614] mb-3 md:mb-4">
              {item.title}
            </h3>
            {item.description && (
              <div className="text-gray-600 text-sm md:text-base leading-relaxed text-justify">
                {item.description.split('\n').map((paragraph, index) => (
                  <p key={index} className={index > 0 ? 'mt-3' : ''}>
                    {paragraph || '\u00A0'}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback to type1
  return (
    <div className="w-full">
      {imageUrl ? (
        <div className="w-full overflow-hidden relative">
          {imageLoading && (
            <div className="absolute inset-0 z-10">
              <ImageSkeleton className="w-full h-96 md:h-[450px] lg:h-[550px] rounded-lg" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={item.title}
            className={`w-full h-96 md:h-[450px] lg:h-[550px] object-cover hover:scale-105 transition-transform duration-500 rounded-lg ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            loading="lazy"
            onLoad={(e) => {
              // Check if image is actually loaded
              const img = e.currentTarget;
              if (img.complete && img.naturalWidth > 0) {
                setImageLoading(false);
                setImageError(false);
              }
            }}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
          {imageError && (
            <div className="w-full h-96 md:h-[450px] lg:h-[550px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-400 text-sm md:text-base">
                خطا در بارگذاری تصویر
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-96 md:h-[450px] lg:h-[550px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
          <span className="text-gray-400 text-sm md:text-base">بدون تصویر</span>
        </div>
      )}
      <div className="px-4 md:px-6 py-5 md:py-6">
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#253614] mb-3 md:mb-4">
          {item.title}
        </h3>
        {item.description && (
          <div className="text-gray-600 text-sm md:text-base leading-relaxed text-justify">
            {item.description.split('\n').map((paragraph, index) => (
              <p key={index} className={index > 0 ? 'mt-3' : ''}>
                {paragraph || '\u00A0'}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
