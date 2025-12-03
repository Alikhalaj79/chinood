"use client";

import CatalogGrid from "./components/CatalogGrid";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9f0] to-white">
      <main className="w-full max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6">
        {/* Page Header
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#253614] mb-2">
            کاتالوگ محصولات
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            مجموعه‌ای از بهترین محصولات و خدمات ما
          </p>
        </div> */}
        <CatalogGrid />
      </main>
    </div>
  );
}
