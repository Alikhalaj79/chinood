"use client";

import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-200 text-green-800"
      : type === "error"
      ? "bg-red-50 border-red-200 text-red-800"
      : "bg-blue-50 border-blue-200 text-blue-800";

  const icon =
    type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";

  return (
    <div
      className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${bgColor} animate-slide-in`}
      role="alert"
    >
      <span className="text-xl font-bold">{icon}</span>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-xl hover:opacity-70 transition-opacity"
        aria-label="بستن پیام"
      >
        ×
      </button>
    </div>
  );
}

