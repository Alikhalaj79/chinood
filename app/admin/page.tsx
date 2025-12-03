"use client";

import React, { useState, useEffect, useMemo } from "react";
import { authenticatedFetch } from "../lib/client-auth";
import { useAutoRefreshToken } from "../lib/hooks/useAutoRefreshToken";
import type { CatalogDTO } from "../lib/types";
import CatalogCard from "../components/CatalogCard";
import Toast from "../components/admin/Toast";
import ConfirmModal from "../components/admin/ConfirmModal";
import { ListSkeleton } from "../components/admin/SkeletonLoader";
import Pagination from "../components/admin/Pagination";

type ToastMessage = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [items, setItems] = useState<CatalogDTO[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemViewType, setItemViewType] = useState<"type1" | "type2" | "type3">(
    "type1"
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    itemId: string | null;
  }>({ isOpen: false, itemId: null });
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState(1);
  const [removeImage, setRemoveImage] = useState(false);
  const [hasOriginalImage, setHasOriginalImage] = useState(false);

  // Auto-refresh token when needed
  useAutoRefreshToken();

  const showToast = (message: string, type: "success" | "error" | "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { ensureValidAccessToken } = await import("../lib/client-auth");
      const token = await ensureValidAccessToken();

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

  // Load items
  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const itemsRes = await authenticatedFetch("/api/catalog");
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setItems(itemsData);
        }
      } catch (err) {
        console.error("Failed to load items", err);
        showToast("خطا در بارگذاری آیتم‌ها", "error");
      } finally {
        setLoadingItems(false);
      }
    };
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Reset to page 1 if current page is out of bounds or items change
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, filteredItems.length]);

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#a3d177] border-t-[#497321] rounded-full animate-spin"></div>
          <div className="text-lg text-[#497321] font-medium">
            در حال بارگذاری...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        showToast("فرمت تصویر باید jpeg، png یا webp باشد", "error");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast("حجم تصویر نباید بیشتر از 5 مگابایت باشد", "error");
        return;
      }

      setImageFile(file);
      setRemoveImage(false); // Reset remove flag when new image is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setRemoveImage(true);
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById(
      "image-input"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleItemViewTypeChange = async (
    itemId: string,
    newType: "type1" | "type2" | "type3"
  ) => {
    setLoadingItems(true);
    try {
      const formData = new FormData();
      formData.append("itemViewType", newType);

      const res = await authenticatedFetch(`/api/catalog/${itemId}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        const itemsRes = await authenticatedFetch("/api/catalog");
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setItems(itemsData);
        }
        showToast("نوع نمایش کارد با موفقیت تغییر کرد", "success");
      } else {
        showToast("خطا در تغییر نوع نمایش", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("خطا در تغییر نوع نمایش", "error");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setLoadingItems(true);
    try {
      const res = await authenticatedFetch(`/api/catalog/${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const itemsRes = await authenticatedFetch("/api/catalog");
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setItems(itemsData);
        }
        showToast("آیتم با موفقیت حذف شد", "success");
      } else {
        showToast("خطا در حذف آیتم", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("خطا در حذف آیتم", "error");
    } finally {
      setLoadingItems(false);
      setDeleteConfirm({ isOpen: false, itemId: null });
    }
  };

  const getImageUrl = (item: CatalogDTO) => {
    if (item.image) {
      if (item.imageMimeType) {
        return `data:${item.imageMimeType};base64,${item.image}`;
      }
      return `/api/images/${item.id}`;
    }
    return null;
  };

  const handleEdit = (item: CatalogDTO) => {
    setEditingItemId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setItemViewType(item.itemViewType || "type1");
    setImageFile(null);
    setRemoveImage(false);
    const imageUrl = getImageUrl(item);
    const hasImage = !!item.image;
    setHasOriginalImage(hasImage);
    if (imageUrl) {
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
    const fileInput = document.getElementById(
      "image-input"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setTitle("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
    setItemViewType("type1");
    setRemoveImage(false);
    setHasOriginalImage(false);
    const fileInput = document.getElementById(
      "image-input"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (editingItemId && removeImage) {
        formData.append("removeImage", "true");
      }
      formData.append("itemViewType", itemViewType);

      let res;
      if (editingItemId) {
        res = await authenticatedFetch(`/api/catalog/${editingItemId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        res = await authenticatedFetch("/api/catalog", {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) {
        const txt = await res.text();
        showToast(
          txt || `خطا در ${editingItemId ? "ویرایش" : "ایجاد"} آیتم`,
          "error"
        );
        return;
      }

      showToast(
        `آیتم با موفقیت ${editingItemId ? "ویرایش" : "ایجاد"} شد`,
        "success"
      );
      handleCancelEdit();
      const itemsRes = await authenticatedFetch("/api/catalog");
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      }
    } catch (err) {
      console.error(err);
      showToast(`خطا در ${editingItemId ? "ویرایش" : "ایجاد"} آیتم`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-6 md:py-12 px-4 bg-gradient-to-b from-[#f0f9f0] to-white">
      <div className="max-w-6xl mx-auto">
        {/* Toast Container */}
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>

        {/* Confirm Delete Modal */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          title="حذف آیتم"
          message="آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟ این عمل قابل بازگشت نیست."
          confirmText="حذف"
          cancelText="لغو"
          type="danger"
          onConfirm={() => {
            if (deleteConfirm.itemId) {
              handleDeleteItem(deleteConfirm.itemId);
            }
          }}
          onCancel={() => setDeleteConfirm({ isOpen: false, itemId: null })}
        />

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#a3d177] mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#a3d177]">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#253614]">
                پردیس گستر چینود
              </h1>
              <p className="text-sm text-gray-600 mt-1">پنل مدیریت</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#497321] hover:bg-[#253614] text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
            >
              خروج
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#a3d177] mb-6">
          {editingItemId && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-semibold flex items-center gap-2">
                <span>✏️</span>
                در حال ویرایش آیتم...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#497321]">
                عنوان <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان آیتم را وارد کنید..."
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#497321]">
                توضیحات
              </label>
              <textarea
                className="w-full px-4 py-3 border-2 border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900 min-h-[120px] resize-y placeholder:text-gray-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیحات آیتم را وارد کنید..."
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#497321]">
                نوع نمایش
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    type: "type1" as const,
                    icon: "📄",
                    label: "Type 1",
                    desc: "عکس بالا",
                  },
                  {
                    type: "type2" as const,
                    icon: "➡️",
                    label: "Type 2",
                    desc: "عکس چپ",
                  },
                  {
                    type: "type3" as const,
                    icon: "⬅️",
                    label: "Type 3",
                    desc: "عکس راست",
                  },
                ].map(({ type, icon, label, desc }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setItemViewType(type)}
                    disabled={loading}
                    className={`p-4 border-2 rounded-lg transition-all text-center ${
                      itemViewType === type
                        ? "border-[#497321] bg-[#f0f9f0] shadow-md"
                        : "border-[#a3d177] hover:border-[#497321] hover:shadow-sm"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="text-2xl mb-2">{icon}</div>
                    <div className="text-sm font-semibold text-[#253614]">
                      {label}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-[#497321]">
                تصویر
              </label>
              <input
                id="image-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="w-full px-4 py-3 border-2 border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#a3d177] file:text-white hover:file:bg-[#497321] file:cursor-pointer file:transition-colors"
                onChange={handleImageChange}
                disabled={loading}
              />
              <p className="mt-2 text-xs text-gray-500">
                فرمت‌های مجاز: JPEG، PNG، WebP | حداکثر حجم: 5 مگابایت
              </p>
              {imagePreview && !removeImage && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    پیش‌نمایش تصویر:
                  </p>
                  <div className="relative inline-block group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-48 object-cover rounded-lg border-2 border-[#a3d177] shadow-sm"
                    />
                    {editingItemId && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={loading}
                        className="absolute top-2 left-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        title="حذف تصویر"
                      >
                        🗑️ حذف تصویر
                      </button>
                    )}
                  </div>
                </div>
              )}
              {editingItemId && hasOriginalImage && removeImage && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ تصویر در حال ویرایش حذف خواهد شد
                  </p>
                </div>
              )}
              {(title || imagePreview || (editingItemId && removeImage)) && (
                <div className="mt-6 p-4 border-2 border-[#a3d177] rounded-lg bg-[#f0f9f0]">
                  <p className="text-sm font-semibold text-[#497321] mb-3">
                    پیش‌نمایش کارد با استایل انتخاب شده:
                  </p>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <CatalogCard
                      item={{
                        id: "preview",
                        title: title || "عنوان نمونه",
                        description: description || "توضیحات نمونه",
                        image:
                          removeImage || !imagePreview
                            ? undefined
                            : imagePreview.split(",")[1],
                        imageMimeType:
                          removeImage || !imagePreview
                            ? undefined
                            : imagePreview.split(";")[0].split(":")[1],
                        itemViewType: itemViewType,
                      }}
                      getImageUrl={(item) => {
                        if (item.image && item.imageMimeType) {
                          return `data:${item.imageMimeType};base64,${item.image}`;
                        }
                        return null;
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${
                  loading ? "bg-[#497321]" : "bg-[#a3d177] hover:bg-[#497321]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    در حال ذخیره...
                  </span>
                ) : editingItemId ? (
                  "ذخیره تغییرات"
                ) : (
                  "ایجاد آیتم"
                )}
              </button>
              {editingItemId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
                  disabled={loading}
                >
                  لغو
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Items List Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#a3d177]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#a3d177]">
            <h2 className="text-xl md:text-2xl font-bold text-[#253614]">
              لیست کاردها
              {items.length > 0 && (
                <span className="mr-2 text-base font-normal text-gray-500">
                  ({items.length})
                </span>
              )}
            </h2>
            {items.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="جستجو در کاردها..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 border-2 border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
                />
                {/* Items Per Page Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 font-medium whitespace-nowrap">
                    نمایش:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border-2 border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900 text-sm font-medium cursor-pointer min-w-[80px]"
                  >
                    {[5, 7, 10, 15, 20].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                    در هر صفحه
                  </span>
                </div>
              </div>
            )}
          </div>

          {loadingItems ? (
            <ListSkeleton />
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-lg text-gray-600 font-medium">
                    نتیجه‌ای یافت نشد
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    برای جستجوی &quot;{searchQuery}&quot; هیچ کاردی پیدا نشد
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-4 py-2 text-[#497321] hover:text-[#253614] font-medium underline"
                  >
                    پاک کردن فیلتر
                  </button>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-lg text-gray-600 font-medium">
                    هیچ کاردی وجود ندارد
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    برای شروع، اولین کارد خود را ایجاد کنید
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {paginatedItems.map((item) => {
                  const currentViewType = item.itemViewType || "type1";
                  return (
                    <div
                      key={item.id}
                      className="border-2 border-[#a3d177] rounded-lg p-4 md:p-6 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="mb-4 pb-4 border-b border-[#a3d177]">
                        <CatalogCard item={item} getImageUrl={getImageUrl} />
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-gray-500 font-semibold">
                          نوع نمایش:
                        </span>
                        {[
                          {
                            type: "type1" as const,
                            label: "Type 1 (عکس بالا)",
                          },
                          {
                            type: "type2" as const,
                            label: "Type 2 (عکس چپ)",
                          },
                          {
                            type: "type3" as const,
                            label: "Type 3 (عکس راست)",
                          },
                        ].map(({ type, label }) => (
                          <button
                            key={type}
                            onClick={() =>
                              handleItemViewTypeChange(item.id, type)
                            }
                            disabled={loadingItems}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium ${
                              currentViewType === type
                                ? "bg-[#497321] text-white shadow-sm"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {label}
                          </button>
                        ))}
                        <div className="flex-1"></div>
                        <button
                          onClick={() => handleEdit(item)}
                          disabled={loadingItems}
                          className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✏️ ویرایش
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ isOpen: true, itemId: item.id })
                          }
                          disabled={loadingItems}
                          className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredItems.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredItems.length}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
