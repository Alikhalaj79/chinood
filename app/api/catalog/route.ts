import { NextResponse } from "next/server";
import { getCatalog } from "../../lib/catalog";
import { verifyRequestAuth } from "../../lib/server-auth";
import CatalogItemModel from "../../lib/models/CatalogItem";

export async function GET() {
  try {
    const items = await getCatalog();
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/catalog error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Check authentication from cookie or header
    const auth = await verifyRequestAuth(req);
    if (!auth.valid) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { title, price, image, description } = body;
    if (!title || typeof price !== "number")
      return new NextResponse("Bad request", { status: 400 });
    await CatalogItemModel.create({ title, price, image, description });
    return new NextResponse("Created", { status: 201 });
  } catch (err) {
    console.error("POST /api/catalog error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
