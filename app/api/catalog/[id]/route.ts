import { NextResponse } from "next/server";
import { getCatalogById } from "../../../lib/catalog";
import { verifyRequestAuth } from "../../../lib/server-auth";
import CatalogItemModel from "../../../lib/models/CatalogItem";
import { connectDB } from "../../../lib/db";

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
    
    // Ensure database connection
    await connectDB();
    
    // Check authentication from cookie or header
    const auth = await verifyRequestAuth(req);
    if (!auth.valid) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const imageFile = formData.get("image") as File | null;
    const removeImage = formData.get("removeImage") === "true";

    if (!title || title.trim() === "") {
      return new NextResponse("عنوان الزامی است", { status: 400 });
    }

    const updateData: any = {
      title: title.trim(),
      description: description?.trim() || undefined,
    };

    if (removeImage) {
      updateData.image = undefined;
      updateData.imageMimeType = undefined;
    } else if (imageFile && imageFile.size > 0) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(imageFile.type)) {
        return new NextResponse("فرمت تصویر باید jpeg، png یا webp باشد", { status: 400 });
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imageFile.size > maxSize) {
        return new NextResponse("حجم تصویر نباید بیشتر از 5 مگابایت باشد", { status: 400 });
      }

      // Convert file to base64
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      updateData.image = buffer.toString("base64");
      updateData.imageMimeType = imageFile.type;
    }
    
    const item = await CatalogItemModel.findByIdAndUpdate(
      id,
      updateData,
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
    
    // Ensure database connection
    await connectDB();
    
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
