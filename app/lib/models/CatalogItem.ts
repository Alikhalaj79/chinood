import mongoose, { Schema, Document } from "mongoose";

export interface ICatalogItem extends Document {
  title: string;
  description?: string;
  price: number;
  image?: string;
  createdAt?: Date;
}

const CatalogItemSchema = new Schema<ICatalogItem>({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in dev & watch mode
export const CatalogItem =
  (mongoose.models && mongoose.models.CatalogItem) ||
  mongoose.model<ICatalogItem>("CatalogItem", CatalogItemSchema);

export default CatalogItem;
