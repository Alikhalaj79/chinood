import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshTokens } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const refreshTokenFromCookie = cookieStore.get("refreshToken")?.value;
    
    // Try to get refresh token from cookie first, then from body
    const { refreshToken: refreshTokenFromBody } = await req.json().catch(() => ({}));
    const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;
    
    if (!refreshToken)
      return new NextResponse("Missing refresh token", { status: 400 });

    const tokens = await refreshTokens(refreshToken);
    if (!tokens)
      return new NextResponse("Invalid or expired refresh token", { status: 401 });

    // Update cookies with new tokens
    cookieStore.set("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });
    
    // Set access token in non-httpOnly cookie for client-side access
    cookieStore.set("accessTokenClient", tokens.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });
    
    cookieStore.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    console.error("POST /api/auth/refresh error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

