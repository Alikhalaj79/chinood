import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshTokens } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const refreshTokenFromCookie = cookieStore.get("refreshToken")?.value;

    // Try to get refresh token from cookie first (preferred method)
    // Also try from body as fallback (for compatibility)
    let refreshTokenFromBody: string | undefined;
    try {
      const contentType = req.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const body = await req.json();
        refreshTokenFromBody = body?.refreshToken;
      }
    } catch {
      // Body is empty or not JSON, that's fine - we'll use cookie
    }

    const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;

    if (!refreshToken) {
      console.error(
        "Missing refresh token - cookie:",
        !!refreshTokenFromCookie,
        "body:",
        !!refreshTokenFromBody
      );
      return NextResponse.json(
        { error: "Missing refresh token" },
        { status: 400 }
      );
    }

    console.log(
      "Refresh token found in:",
      refreshTokenFromCookie ? "cookie" : "body"
    );
    console.log("Refresh token length:", refreshToken.length);
    console.log(
      "Refresh token preview:",
      refreshToken.substring(0, 20) + "..."
    );

    console.log("Refresh token found, attempting to refresh...");
    const tokens = await refreshTokens(refreshToken);
    if (!tokens) {
      console.error(
        "Invalid or expired refresh token - token verification or DB check failed"
      );
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    console.log("Tokens refreshed successfully");

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
