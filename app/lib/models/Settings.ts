import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  catalogViewType: "grid" | "list" | "card";
  cardDirection: "top-to-bottom" | "bottom-to-top";
  itemsPerPage?: number;
  updatedAt?: Date;
}

const SettingsSchema = new Schema<ISettings>({
  catalogViewType: { 
    type: String, 
    enum: ["grid", "list", "card"], 
    default: "list" 
  },
  cardDirection: {
    type: String,
    enum: ["top-to-bottom", "bottom-to-top"],
    default: "top-to-bottom"
  },
  itemsPerPage: {
    type: Number,
    default: 7,
    min: 1,
    max: 50
  },
  updatedAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in dev & watch mode
export const Settings =
  (mongoose.models && mongoose.models.Settings) ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;




