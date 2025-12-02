import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginUser } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password)
      return new NextResponse("Missing credentials", { status: 400 });

    const tokens = await loginUser(username, password);
    if (!tokens)
      return new NextResponse("Invalid credentials", { status: 401 });

    const cookieStore = await cookies();

    // Set access token cookie (httpOnly for security)
    cookieStore.set("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15 * 24 * 7, // 7 days
      path: "/",
    });

    // Set access token in non-httpOnly cookie for client-side access
    cookieStore.set("accessTokenClient", tokens.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15 * 24 * 7 , // 7 days
      path: "/",
    });

    // Set refresh token cookie (7 days, httpOnly for security)
    cookieStore.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 20, // 20 days
      path: "/",
    });

    return NextResponse.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      message: "Login successful",
    });
  } catch (err) {
    console.error("POST /api/auth/login error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
