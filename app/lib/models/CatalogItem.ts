import mongoose, { Schema, Document } from "mongoose";

export interface ICatalogItem extends Document {
  title: string;
  description?: string;
  image?: string;
  imageMimeType?: string;
  itemViewType?: "type1" | "type2" | "type3";
  createdAt?: Date;
}

const CatalogItemSchema = new Schema<ICatalogItem>({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String }, // base64 encoded image
  imageMimeType: { type: String }, // e.g., "image/jpeg", "image/png"
  itemViewType: { 
    type: String, 
    enum: ["type1", "type2", "type3"], 
    default: "type1" 
  },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in dev & watch mode
export const CatalogItem =
  (mongoose.models && mongoose.models.CatalogItem) ||
  mongoose.model<ICatalogItem>("CatalogItem", CatalogItemSchema);

export default CatalogItem;
