import { connectDB } from "./db";
import CatalogItemModel from "./models/CatalogItem";
import { CatalogDTO } from "./types";

export async function getCatalog(): Promise<CatalogDTO[]> {
  await connectDB();
  // Exclude image data from query to improve performance
  // Images are served via /api/images/[id] endpoint
  const docs = await CatalogItemModel.find({})
    .select("-image")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((d: any) => ({
    id: d._id.toString(),
    title: d.title,
    description: d.description,
    image: undefined, // Don't include base64 image data
    imageMimeType: d.imageMimeType, // Keep mimeType to know if image exists
    itemViewType: d.itemViewType || "type1",
  }));
}

export async function getCatalogById(id: string): Promise<CatalogDTO | null> {
  await connectDB();
  const d = await CatalogItemModel.findById(id).lean();
  if (!d) return null;
  return {
    id: d._id.toString(),
    title: d.title,
    description: d.description,
    image: d.image,
    imageMimeType: d.imageMimeType,
    itemViewType: d.itemViewType || "type1",
  };
}

export default { getCatalog, getCatalogById };
