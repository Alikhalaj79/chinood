"use client";

import CatalogGrid from "./components/CatalogGrid";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9f0] to-white">
      <header className="bg-white border-b border-[#a3d177] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-[#253614]">
            پردیس گستر چینود
          </h1>
          <p className="text-gray-600 mt-1">کاتالوگ محصولات</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8">
        <CatalogGrid />
      </main>
    </div>
  );
}
