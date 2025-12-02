"use client";

import React, { useState, useEffect } from "react";
import { authenticatedFetch } from "../lib/client-auth";
import { useAutoRefreshToken } from "../lib/hooks/useAutoRefreshToken";

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Auto-refresh token when needed
  useAutoRefreshToken();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      // First, try to ensure we have a valid access token (will refresh if needed)
      const { ensureValidAccessToken } = await import("../lib/client-auth");
      const token = await ensureValidAccessToken();

      if (!token) {
        // No token available even after refresh attempt, redirect to login
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setMessage("فرمت تصویر باید jpeg، png یا webp باشد");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setMessage("حجم تصویر نباید بیشتر از 5 مگابایت باشد");
        return;
      }

      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      if (description.trim()) {
        formData.append("description", description);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await authenticatedFetch("/api/catalog", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        setMessage(txt || "خطا در ایجاد آیتم");
        return;
      }

      setMessage("آیتم با موفقیت ایجاد شد");
      // Reset form
      setTitle("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      // Reset file input
      const fileInput = document.getElementById(
        "image-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error(err);
      setMessage("خطا در ایجاد آیتم");
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
                type="text"
                className="w-full px-4 py-2 border border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#497321]">
                توضیحات
              </label>
              <textarea
                className="w-full px-4 py-2 border border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900 min-h-[100px] resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیحات آیتم را وارد کنید..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[#497321]">
                تصویر
              </label>
              <input
                id="image-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="w-full px-4 py-2 border border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#a3d177] file:text-white hover:file:bg-[#497321] file:cursor-pointer"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">پیش‌نمایش تصویر:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-lg border border-[#a3d177]"
                  />
                </div>
              )}
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
