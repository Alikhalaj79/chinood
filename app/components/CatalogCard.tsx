"use client";

import React from "react";
import type { CatalogDTO } from "../lib/types";

interface CatalogCardProps {
  item: CatalogDTO;
  getImageUrl: (item: CatalogDTO) => string | null;
}

export default function CatalogCard({ item, getImageUrl }: CatalogCardProps) {
  const imageUrl = getImageUrl(item);
  const viewType = item.itemViewType || "type1";

  // Type 1: Image on top, title and description below
  if (viewType === "type1") {
    return (
      <div className="w-full shadow-sm">
        {imageUrl ? (
          <div className="w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-64 md:h-80 lg:h-96 object-cover hover:scale-105 transition-transform duration-500 rounded-lg"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
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
              <div className="w-full overflow-hidden">
                <img
                  src={imageUrl}
                  alt={item.title}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover hover:scale-105 transition-transform duration-500 rounded-lg"
                  loading="lazy"
                />
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
              <div className="w-full overflow-hidden">
                <img
                  src={imageUrl}
                  alt={item.title}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover hover:scale-105 transition-transform duration-500 rounded-lg"
                  loading="lazy"
                />
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
        <div className="w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-64 md:h-80 lg:h-96 object-cover hover:scale-105 transition-transform duration-500 rounded-lg"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
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
