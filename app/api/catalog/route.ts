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

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (!title || title.trim() === "") {
      return new NextResponse("عنوان الزامی است", { status: 400 });
    }

    let image: string | undefined;
    let imageMimeType: string | undefined;

    if (imageFile && imageFile.size > 0) {
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
      image = buffer.toString("base64");
      imageMimeType = imageFile.type;
    }

    await CatalogItemModel.create({
      title: title.trim(),
      description: description?.trim() || undefined,
      image,
      imageMimeType,
    });

    return new NextResponse("Created", { status: 201 });
  } catch (err) {
    console.error("POST /api/catalog error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
