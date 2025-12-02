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
 * Refresh access token using refresh token
 * Returns new tokens or null if refresh failed
 */
export async function refreshAccessToken(): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const { accessToken, refreshToken: newRefreshToken } = await res.json();
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
 * Fetch with automatic token refresh on 401
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let accessToken = getAccessToken();

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

  // If 401, try to refresh token and retry once
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
