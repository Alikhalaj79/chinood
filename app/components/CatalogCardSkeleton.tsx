"use client";

import React from "react";

export default function CatalogCardSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-200 rounded-lg mb-4"></div>
      {/* Content skeleton */}
      <div className="px-4 space-y-3">
        <div className="h-7 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function CatalogCardSkeletonHorizontal() {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-center animate-pulse">
      <div className="flex-1 w-full md:w-auto">
        <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="flex-1 px-4 w-full space-y-3">
        <div className="h-7 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

