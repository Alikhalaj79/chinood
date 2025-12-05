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
      settings = await Settings.create({ catalogViewType: "list", cardDirection: "top-to-bottom", itemsPerPage: 7 });
    }
    return NextResponse.json({ 
      catalogViewType: settings.catalogViewType,
      cardDirection: settings.cardDirection || "top-to-bottom",
      itemsPerPage: settings.itemsPerPage || 7
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
    const { catalogViewType, cardDirection, itemsPerPage } = body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ 
        catalogViewType: catalogViewType || "list",
        cardDirection: cardDirection || "top-to-bottom",
        itemsPerPage: itemsPerPage || 7
      });
    } else {
      if (catalogViewType && ["grid", "list", "card"].includes(catalogViewType)) {
        settings.catalogViewType = catalogViewType;
      }
      if (cardDirection && ["top-to-bottom", "bottom-to-top"].includes(cardDirection)) {
        settings.cardDirection = cardDirection;
      }
      if (itemsPerPage !== undefined && itemsPerPage >= 1 && itemsPerPage <= 50) {
        settings.itemsPerPage = itemsPerPage;
      }
      settings.updatedAt = new Date();
      await settings.save();
    }

    return NextResponse.json({ 
      catalogViewType: settings.catalogViewType,
      cardDirection: settings.cardDirection || "top-to-bottom",
      itemsPerPage: settings.itemsPerPage || 7
    });
  } catch (err) {
    console.error("PUT /api/settings error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

