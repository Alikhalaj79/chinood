"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "../lib/client-auth";
import { ensureValidAccessToken } from "../lib/client-auth";

export default function Header() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = await ensureValidAccessToken();
        if (!token) {
          setIsAdmin(false);
          return;
        }

        const res = await authenticatedFetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.authenticated === true && data.user?.admin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  return (
    <header className="w-full py-2 px-4 md:px-6 border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-base md:text-lg font-bold text-[#253614]">
          پردیس گستر چینود
        </h1>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-1.5 text-sm font-semibold bg-[#497321] hover:bg-[#253614] text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              پنل ادمین
            </Link>
          )}
          <Link href="/" className="w-20 md:w-24 h-auto flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="لوگو چینود"
              width={128}
              height={110}
              priority
              className="w-full h-auto"
              unoptimized
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
