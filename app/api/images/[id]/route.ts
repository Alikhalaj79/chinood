import { NextResponse } from "next/server";
import CatalogItemModel from "../../../lib/models/CatalogItem";
import { connectDB } from "../../../lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const item = await CatalogItemModel.findById(id).lean();
    if (!item || !item.image) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const imageBuffer = Buffer.from(item.image, "base64");
    const contentType = item.imageMimeType || "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("GET /api/images/[id] error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

