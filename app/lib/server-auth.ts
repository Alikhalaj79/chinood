// Server-side authentication utilities
// These functions help extract tokens from cookies or headers

import { cookies } from "next/headers";
import { verifyAccessToken, refreshTokens } from "./auth";

/**
 * Get access token from request (cookie or header)
 */
export async function getAccessTokenFromRequest(req: Request): Promise<string | null> {
  // Try to get from cookie first
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get("accessToken")?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // Fallback to Authorization header
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "");
  }

  return null;
}

/**
 * Get refresh token from cookie
 */
export async function getRefreshTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("refreshToken")?.value || null;
}

/**
 * Set tokens in cookies
 */
export async function setTokensInCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();

  // Set access token cookie (httpOnly for security)
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  });

  // Set access token in non-httpOnly cookie for client-side access
  cookieStore.set("accessTokenClient", accessToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  });

  // Set refresh token cookie (7 days, httpOnly for security)
  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Verify authentication from request with automatic token refresh
 * If access token is expired, automatically tries to refresh using refresh token
 */
export async function verifyRequestAuth(req: Request): Promise<{
  valid: boolean;
  payload?: { admin?: boolean; username?: string };
  refreshed?: boolean; // Indicates if token was refreshed
}> {
  const token = await getAccessTokenFromRequest(req);
  
  // If we have a token, verify it
  if (token) {
    const payload = verifyAccessToken(token);
    if (payload && payload.admin === true) {
      // Token is valid
      return { valid: true, payload, refreshed: false };
    }
    // Token exists but is invalid/expired - try to refresh
  }

  // No valid access token, try to refresh using refresh token
  const refreshToken = await getRefreshTokenFromCookie();
  if (!refreshToken) {
    return { valid: false };
  }

  // Try to refresh tokens
  const newTokens = await refreshTokens(refreshToken);
  if (!newTokens) {
    return { valid: false };
  }

  // Update cookies with new tokens
  await setTokensInCookies(newTokens.accessToken, newTokens.refreshToken);

  // Verify the new access token
  const newPayload = verifyAccessToken(newTokens.accessToken);
  if (!newPayload || newPayload.admin !== true) {
    return { valid: false };
  }

  return { valid: true, payload: newPayload, refreshed: true };
}

