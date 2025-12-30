import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import Settings from "../../lib/models/Settings";
import { verifyRequestAuth } from "../../lib/server-auth";

export async function GET() {
  try {
    await connectDB();
    
    // Get settings or return defaults
    let settings = await Settings.findOne().lean();
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await Settings.create({
        catalogViewType: "list",
        cardDirection: "top-to-bottom",
        itemsPerPage: 7,
      });
      settings = defaultSettings.toObject();
    }
    
    return NextResponse.json({
      catalogViewType: settings.catalogViewType || "list",
      cardDirection: settings.cardDirection || "top-to-bottom",
      itemsPerPage: settings.itemsPerPage || 7,
    });
  } catch (err: any) {
    console.error("GET /api/settings error", err);
    return NextResponse.json(
      { 
        error: "Server error", 
        message: err?.message || String(err),
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    // Check authentication
    const auth = await verifyRequestAuth(req);
    if (!auth.valid) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { catalogViewType, cardDirection, itemsPerPage } = body;

    await connectDB();

    // Get existing settings or create new
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        catalogViewType: catalogViewType || "list",
        cardDirection: cardDirection || "top-to-bottom",
        itemsPerPage: itemsPerPage || 7,
      });
    } else {
      // Update only provided fields
      if (catalogViewType !== undefined) {
        settings.catalogViewType = catalogViewType;
      }
      if (cardDirection !== undefined) {
        settings.cardDirection = cardDirection;
      }
      if (itemsPerPage !== undefined) {
        settings.itemsPerPage = itemsPerPage;
      }
      settings.updatedAt = new Date();
      await settings.save();
    }

    return NextResponse.json({
      catalogViewType: settings.catalogViewType,
      cardDirection: settings.cardDirection,
      itemsPerPage: settings.itemsPerPage,
    });
  } catch (err: any) {
    console.error("PUT /api/settings error", err);
    return NextResponse.json(
      { 
        error: "Server error", 
        message: err?.message || String(err),
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined
      },
      { status: 500 }
    );
  }
}
