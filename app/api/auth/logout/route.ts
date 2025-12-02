import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeRefreshToken } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // Try to get refresh token from cookie first, then from body
    const { refreshToken: refreshTokenFromBody } = await req
      .json()
      .catch(() => ({}));
    const tokenToRevoke = refreshToken || refreshTokenFromBody;

    if (tokenToRevoke) {
      await revokeRefreshToken(tokenToRevoke);
    }

    // Clear cookies
    cookieStore.delete("accessToken");
    cookieStore.delete("accessTokenClient");
    cookieStore.delete("refreshToken");

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("POST /api/auth/logout error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
