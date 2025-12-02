"use client";

import CatalogGrid from "./components/CatalogGrid";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9f0] to-white">
      
      <main className="max-w-7xl mx-auto py-8">
        <CatalogGrid />
      </main>
    </div>
  );
}
