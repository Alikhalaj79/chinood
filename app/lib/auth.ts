import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "./models/RefreshToken";
import { connectDB } from "./db";

// Minimal static admin auth — checks username/password against environment variables
// For local dev, set ADMIN_USERNAME and ADMIN_PASSWORD in your .env or environment
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password";

// Access token expires in 15 minutes
const ACCESS_TOKEN_EXPIRY = "15m";
// Refresh token expires in 7 days
const REFRESH_TOKEN_EXPIRY = "7d";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  admin?: boolean;
  username?: string;
  iat?: number;
  exp?: number;
}

/**
 * Check provided credentials against simple static credentials. Returns access token and refresh token if valid.
 */
export async function loginUser(username: string, password: string): Promise<TokenPair | null> {
  if (!username || !password) return null;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return null;

  // Generate access token (short-lived)
  const accessToken = jwt.sign(
    { admin: true, username },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // Generate refresh token (long-lived)
  const refreshTokenValue = crypto.randomBytes(64).toString("hex");
  const refreshTokenJWT = jwt.sign(
    { admin: true, username, tokenId: refreshTokenValue },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Store refresh token in database
  await connectDB();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await RefreshToken.create({
    token: refreshTokenValue,
    username,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken: refreshTokenJWT,
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token?: string): TokenPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verify refresh token and return new token pair
 */
export async function refreshTokens(refreshToken?: string): Promise<TokenPair | null> {
  if (!refreshToken) return null;

  try {
    // Verify refresh token JWT
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload & { tokenId?: string };
    
    if (!decoded.tokenId || !decoded.username) return null;

    // Check if refresh token exists in database
    await connectDB();
    const storedToken = await RefreshToken.findOne({ token: decoded.tokenId });
    
    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Token expired or not found, delete it
      if (storedToken) {
        await RefreshToken.deleteOne({ token: decoded.tokenId });
      }
      return null;
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { admin: true, username: decoded.username },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Optionally rotate refresh token (generate new one)
    const newRefreshTokenValue = crypto.randomBytes(64).toString("hex");
    const newRefreshTokenJWT = jwt.sign(
      { admin: true, username: decoded.username, tokenId: newRefreshTokenValue },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Update refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.updateOne(
      { token: decoded.tokenId },
      {
        token: newRefreshTokenValue,
        expiresAt,
      }
    );

    return {
      accessToken,
      refreshToken: newRefreshTokenJWT,
    };
  } catch (error) {
    console.error("Refresh token error:", error);
    return null;
  }
}

/**
 * Revoke refresh token (logout)
 */
export async function revokeRefreshToken(refreshToken?: string): Promise<boolean> {
  if (!refreshToken) return false;

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload & { tokenId?: string };
    
    if (!decoded.tokenId) return false;

    await connectDB();
    await RefreshToken.deleteOne({ token: decoded.tokenId });
    return true;
  } catch {
    return false;
  }
}

// Legacy function for backward compatibility (deprecated)
export function verifyToken(token?: string): TokenPayload | null {
  return verifyAccessToken(token);
}
