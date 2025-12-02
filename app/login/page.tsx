"use client";

import React, { useState, useEffect } from "react";
import { getAccessToken } from "../lib/client-auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      window.location.href = "/admin";
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError("لطفاً نام کاربری و رمز عبور را وارد کنید");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Important for cookies
      });

      if (!res.ok) {
        const txt = await res.text();
        setError(txt || "نام کاربری یا رمز عبور اشتباه است");
        return;
      }

      // Tokens are now set in cookies by the server
      // Redirect to admin dashboard
      window.location.href = "/admin";
    } catch (err) {
      setError("خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f9f0] to-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-[#a3d177]">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-[#253614]">
              پردیس گستر چینود
            </h1>
            <p className="text-gray-600">
              برای ورود به پنل مدیریت، اطلاعات خود را وارد کنید
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2 text-[#497321]"
              >
                نام کاربری
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900"
                placeholder="نام کاربری را وارد کنید"
                autoComplete="username"
                disabled={loading}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 text-[#497321]"
              >
                رمز عبور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#a3d177] rounded-lg focus:ring-2 focus:ring-[#a3d177] focus:border-[#497321] outline-none transition-all bg-white text-gray-900 pl-12"
                  placeholder="رمز عبور را وارد کنید"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#497321] hover:text-[#253614] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.07 5.343M6.29 6.29L12 12m0 0l5.71 5.71M12 12l-5.71-5.71m5.71 5.71l5.71 5.71"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                loading ? "bg-[#497321]" : "bg-[#a3d177] hover:bg-[#497321]"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>در حال ورود...</span>
                </>
              ) : (
                <span>ورود</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm pt-4 border-t border-[#a3d177] text-[#497321]">
            <p>پردیس گستر چینود</p>
          </div>
        </div>
      </div>
    </div>
  );
}
