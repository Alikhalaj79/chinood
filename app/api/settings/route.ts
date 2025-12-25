import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import Settings from "../../lib/models/Settings";
import { verifyRequestAuth } from "../../lib/server-auth";

export async function GET() {
  try {
    await connectDB();
    
    // Settings is a singleton - get the first (and only) document
    // If it doesn't exist, return defaults
    const settings = await Settings.findOne().lean();
    
    if (!settings) {
      // Return default values if no settings exist
      return NextResponse.json({
        catalogViewType: "list",
        cardDirection: "top-to-bottom",
        itemsPerPage: 7,
      });
    }
    
    return NextResponse.json({
      catalogViewType: settings.catalogViewType || "list",
      cardDirection: settings.cardDirection || "top-to-bottom",
      itemsPerPage: settings.itemsPerPage || 7,
    });
  } catch (err) {
    console.error("GET /api/settings error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    
    // Check authentication
    const auth = await verifyRequestAuth(req);
    if (!auth.valid) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    
    const body = await req.json();
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    // Update catalogViewType if provided
    if (body.catalogViewType !== undefined) {
      if (["grid", "list", "card"].includes(body.catalogViewType)) {
        updateData.catalogViewType = body.catalogViewType;
      } else {
        return new NextResponse("نوع نمایش کاتالوگ نامعتبر است", { status: 400 });
      }
    }
    
    // Update cardDirection if provided
    if (body.cardDirection !== undefined) {
      if (["top-to-bottom", "bottom-to-top"].includes(body.cardDirection)) {
        updateData.cardDirection = body.cardDirection;
      } else {
        return new NextResponse("جهت نمایش کارت نامعتبر است", { status: 400 });
      }
    }
    
    // Update itemsPerPage if provided
    if (body.itemsPerPage !== undefined) {
      const itemsPerPage = Number(body.itemsPerPage);
      if (isNaN(itemsPerPage) || itemsPerPage < 1 || itemsPerPage > 50) {
        return new NextResponse("تعداد آیتم‌های هر صفحه باید بین 1 تا 50 باشد", { status: 400 });
      }
      updateData.itemsPerPage = itemsPerPage;
    }
    
    // Settings is a singleton - use findOneAndUpdate with upsert
    const settings = await Settings.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    
    return NextResponse.json({
      catalogViewType: settings.catalogViewType || "list",
      cardDirection: settings.cardDirection || "top-to-bottom",
      itemsPerPage: settings.itemsPerPage || 7,
    });
  } catch (err) {
    console.error("PUT /api/settings error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
