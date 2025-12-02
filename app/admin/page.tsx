"use client";

import React, { useState, useEffect } from "react";
import { authenticatedFetch, getAccessToken } from "../lib/client-auth";

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await authenticatedFetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        window.location.href = "/login";
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await authenticatedFetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = "/login";
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f0f9f0] to-white">
        <div className="text-lg text-[#497321]">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await authenticatedFetch("/api/catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, price: Number(price), image }),
      });
      if (!res.ok) {
        const txt = await res.text();
        setMessage(txt || "Failed");
        return;
      }
      setMessage("Created.");
      // Reset form
      setTitle("");
      setPrice("");
      setImage("");
    } catch (err) {
      console.error(err);
      setMessage("Error creating item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-[#f0f9f0] to-white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-[#a3d177]">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#a3d177]">
            <h1 className="text-3xl font-bold text-[#253614]">
              پردیس گستر چینود
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#497321] hover:bg-[#253614] text-white rounded-lg transition-colors"
            >
              خروج
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#497321]">
                عنوان
              </label>
              <input
                className="w-full px-4 py-2 border border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#497321]">
                قیمت
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900"
                value={price === "" ? "" : price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#497321]">
                URL تصویر
              </label>
              <input
                className="w-full px-4 py-2 border border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
            {message && (
              <div className="p-3 border border-[#a3d177] rounded-lg bg-[#f0f9f0] text-[#497321]">
                {message}
              </div>
            )}
            <button
              type="submit"
              className={`w-full px-4 py-2 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                loading ? "bg-[#497321]" : "bg-[#a3d177] hover:bg-[#497321]"
              }`}
              disabled={loading}
            >
              {loading ? "در حال ذخیره..." : "ایجاد"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
