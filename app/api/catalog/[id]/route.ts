import { NextResponse } from "next/server";
import { getCatalogById } from "../../../lib/catalog";
import { verifyRequestAuth } from "../../../lib/server-auth";
import CatalogItemModel from "../../../lib/models/CatalogItem";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await getCatalogById(id);
    if (!item) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json(item);
  } catch (err) {
    console.error("GET /api/catalog/[id] error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication from cookie or header
    const auth = await verifyRequestAuth(req);
    if (!auth.valid) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { title, price, image, description } = body;
    
    const item = await CatalogItemModel.findByIdAndUpdate(
      id,
      { title, price, image, description },
      { new: true }
    );
    
    if (!item) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error("PUT /api/catalog/[id] error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication from cookie or header
    const auth = await verifyRequestAuth(req);
    if (!auth.valid) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const item = await CatalogItemModel.findByIdAndDelete(id);
    if (!item) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/catalog/[id] error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
