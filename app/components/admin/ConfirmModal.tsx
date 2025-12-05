"use client";

import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "تأیید",
  cancelText = "لغو",
  onConfirm,
  onCancel,
  type = "danger",
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const buttonColor =
    type === "danger"
      ? "bg-red-500 hover:bg-red-600"
      : type === "warning"
      ? "bg-yellow-500 hover:bg-yellow-600"
      : "bg-blue-500 hover:bg-blue-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-[#253614] mb-3">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 ${buttonColor} text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                در حال حذف...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

