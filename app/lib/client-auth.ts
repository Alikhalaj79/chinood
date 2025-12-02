// Client-side authentication utilities
// These functions handle access token and refresh token management from cookies

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

/**
 * Set cookie
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Delete cookie
 */
function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function getAccessToken(): string | null {
  // Get from non-httpOnly cookie (set by server for client-side access)
  return getCookie("accessTokenClient");
}

export function getRefreshToken(): string | null {
  // Refresh token is httpOnly, so we can't access it from client
  // But we can use it via API calls
  return null; // Will be handled server-side
}

export function setTokens(accessToken: string, refreshToken: string): void {
  // Set access token in non-httpOnly cookie for client-side access
  // Refresh token is already set in httpOnly cookie by server
  setCookie("accessTokenClient", accessToken, 1); // 1 day (will be refreshed)
}

export function clearTokens(): void {
  deleteCookie("accessTokenClient");
  // Refresh token and httpOnly accessToken will be cleared by server on logout
}

/**
 * Decode JWT token without verification (client-side only, for checking expiry)
 */
function decodeToken(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * Check if access token is expired or about to expire (within 1 minute)
 */
export function isTokenExpiredOrExpiringSoon(token: string | null): boolean {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const oneMinute = 60 * 1000; // 1 minute in milliseconds

  // Token is expired or will expire within 1 minute
  return expiryTime <= now + oneMinute;
}

/**
 * Refresh access token using refresh token
 * Returns new tokens or null if refresh failed
 */
export async function refreshAccessToken(): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  try {
    console.log("Attempting to refresh access token...");
    // Refresh token is in httpOnly cookie, so we don't need to send it in body
    // credentials: "include" will automatically send the refreshToken cookie
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include", // Important: sends refreshToken cookie automatically
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Refresh token failed:", res.status, errorText);
      clearTokens();
      return null;
    }

    const { accessToken, refreshToken: newRefreshToken } = await res.json();
    console.log("Token refresh successful");
    // Tokens are set in cookies by server, but we also update client cookie
    setTokens(accessToken, newRefreshToken);
    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.error("Failed to refresh token:", error);
    clearTokens();
    return null;
  }
}

/**
 * Ensure we have a valid access token, refreshing if needed
 * This should be called when the page loads or when access token is missing
 */
export async function ensureValidAccessToken(): Promise<string | null> {
  const accessToken = getAccessToken();

  // If we don't have a token or it's expired, try to refresh
  if (isTokenExpiredOrExpiringSoon(accessToken)) {
    const newTokens = await refreshAccessToken();
    if (newTokens) {
      return newTokens.accessToken;
    }
    return null;
  }

  return accessToken;
}

/**
 * Fetch with automatic token refresh on expiry or 401
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let accessToken = getAccessToken();

  // Check if token is expired or about to expire, refresh proactively
  if (isTokenExpiredOrExpiringSoon(accessToken)) {
    const newTokens = await refreshAccessToken();
    if (newTokens) {
      accessToken = newTokens.accessToken;
    } else {
      // Refresh failed, redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
        // Return a rejected promise to prevent further execution
        return Promise.reject(new Error("Authentication failed"));
      }
    }
  }

  // Add authorization header and include credentials for cookies
  const headers = {
    ...options.headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Important for cookies
  });

  // If 401, try to refresh token and retry once (fallback)
  if (response.status === 401) {
    const newTokens = await refreshAccessToken();
    if (newTokens) {
      // Retry with new access token
      headers.Authorization = `Bearer ${newTokens.accessToken}`;
      response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    } else {
      // Refresh failed, redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return response;
}
