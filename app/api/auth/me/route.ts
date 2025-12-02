import { NextResponse } from "next/server";
import { verifyRequestAuth } from "../../../lib/server-auth";

/**
 * GET /api/auth/me
 * Check if user is authenticated and return user info
 */
export async function GET(req: Request) {
  try {
    const auth = await verifyRequestAuth(req);
    
    if (!auth.valid || !auth.payload) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    // Return user info from token
    return NextResponse.json({
      authenticated: true,
      user: {
        username: auth.payload.username,
        admin: auth.payload.admin,
      },
    });
  } catch (err) {
    console.error("GET /api/auth/me error", err);
    return NextResponse.json(
      { authenticated: false, error: "Server error" },
      { status: 500 }
    );
  }
}

