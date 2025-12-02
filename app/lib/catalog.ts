import { connectDB } from "./db";
import CatalogItemModel from "./models/CatalogItem";
import { CatalogDTO } from "./types";

export async function getCatalog(): Promise<CatalogDTO[]> {
  await connectDB();
  const docs = await CatalogItemModel.find({}).lean();
  return docs.map((d: any) => ({
    id: d._id.toString(),
    title: d.title,
    price: d.price,
    image: d.image,
  }));
}

export async function getCatalogById(id: string): Promise<CatalogDTO | null> {
  await connectDB();
  const d = await CatalogItemModel.findById(id).lean();
  if (!d) return null;
  return {
    id: d._id.toString(),
    title: d.title,
    price: d.price,
    image: d.image,
  };
}

export default { getCatalog, getCatalogById };
