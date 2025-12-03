import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  catalogViewType: "grid" | "list" | "card";
  updatedAt?: Date;
}

const SettingsSchema = new Schema<ISettings>({
  catalogViewType: { 
    type: String, 
    enum: ["grid", "list", "card"], 
    default: "list" 
  },
  updatedAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in dev & watch mode
export const Settings =
  (mongoose.models && mongoose.models.Settings) ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;




