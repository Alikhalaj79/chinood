"use client";

import { useEffect, useRef } from "react";
import { getAccessToken, refreshAccessToken, isTokenExpiredOrExpiringSoon, ensureValidAccessToken } from "../client-auth";

/**
 * Hook to automatically refresh access token when it's about to expire
 * Checks token expiry every minute and refreshes if needed
 * Also checks immediately on mount
 */
export function useAutoRefreshToken() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isCheckingRef.current) return;
      
      isCheckingRef.current = true;
      try {
        const accessToken = getAccessToken();
        
        // If token is expired or about to expire, refresh it
        if (isTokenExpiredOrExpiringSoon(accessToken)) {
          console.log("Token expired or expiring soon, refreshing...");
          const newTokens = await refreshAccessToken();
          if (!newTokens) {
            // Refresh failed, redirect to login
            console.log("Token refresh failed, redirecting to login");
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          } else {
            console.log("Token refreshed successfully");
          }
        }
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Check immediately on mount - this ensures we get a token if refreshToken exists
    ensureValidAccessToken().then((token) => {
      if (!token) {
        console.log("No valid access token available, checking refresh token...");
        checkAndRefreshToken();
      }
    });

    // Check every minute
    intervalRef.current = setInterval(checkAndRefreshToken, 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}

