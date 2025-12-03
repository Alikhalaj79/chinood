import { NextResponse } from "next/server";
import Settings from "../../lib/models/Settings";
import { connectDB } from "../../lib/db";
import { verifyRequestAuth } from "../../lib/server-auth";

// GET: Fetch settings (public - no authentication required)
export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ catalogViewType: "list" });
    }
    return NextResponse.json({ 
      catalogViewType: settings.catalogViewType 
    });
  } catch (err) {
    console.error("GET /api/settings error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

// PUT: Update settings (requires authentication)
export async function PUT(req: Request) {
  try {
    await connectDB();
    
    const auth = await verifyRequestAuth(req);
    if (!auth.valid) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { catalogViewType } = body;

    if (!catalogViewType || !["grid", "list", "card"].includes(catalogViewType)) {
      return new NextResponse("Invalid view type", { status: 400 });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ catalogViewType });
    } else {
      settings.catalogViewType = catalogViewType;
      settings.updatedAt = new Date();
      await settings.save();
    }

    return NextResponse.json({ 
      catalogViewType: settings.catalogViewType 
    });
  } catch (err) {
    console.error("PUT /api/settings error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

