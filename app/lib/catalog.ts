import { connectDB } from "./db";
import CatalogItemModel, { ICatalogItem } from "./models/CatalogItem";
import { CatalogDTO } from "./types";

export async function getCatalog(): Promise<CatalogDTO[]> {
  await connectDB();
  // Exclude image data from query to improve performance
  // Images are served via /api/images/[id] endpoint
  const docs = await CatalogItemModel.find({})
    .select("-image")
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((d: ICatalogItem & { _id: { toString(): string } }) => ({
    id: d._id.toString(),
    title: d.title,
    description: d.description,
    image: undefined, // Don't include base64 image data
    imageMimeType: d.imageMimeType, // Keep mimeType to know if image exists
    itemViewType: d.itemViewType || "type1",
  }));
}

export async function getCatalogPaginated(
  page: number = 1,
  limit: number = 10,
  cardDirection: "top-to-bottom" | "bottom-to-top" = "top-to-bottom"
): Promise<{ items: CatalogDTO[]; total: number; totalPages: number }> {
  await connectDB();
  const skip = (page - 1) * limit;

  // Determine sort order based on cardDirection
  // top-to-bottom: newest first (createdAt: -1)
  // bottom-to-top: oldest first (createdAt: 1)
  const sortOrder = cardDirection === "top-to-bottom" ? -1 : 1;

  // Get total count and items in parallel for better performance
  const [total, docs] = await Promise.all([
    CatalogItemModel.countDocuments({}),
    CatalogItemModel.find({})
      .select("-image")
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const items = docs.map(
    (d: ICatalogItem & { _id: { toString(): string } }) => ({
      id: d._id.toString(),
      title: d.title,
      description: d.description,
      image: undefined, // Don't include base64 image data
      imageMimeType: d.imageMimeType, // Keep mimeType to know if image exists
      itemViewType: d.itemViewType || "type1",
    })
  );

  return {
    items,
    total,
    totalPages: Math.ceil(total / limit),
  };
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

const catalogService = { getCatalog, getCatalogById, getCatalogPaginated };
export default catalogService;
