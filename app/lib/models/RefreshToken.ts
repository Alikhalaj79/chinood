import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
  token: string;
  userId?: string;
  username?: string;
  expiresAt: Date;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true, unique: true, index: true },
  userId: { type: String },
  username: { type: String },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  createdAt: { type: Date, default: Date.now },
});

// Auto-delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken =
  (mongoose.models && mongoose.models.RefreshToken) ||
  mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);

export default RefreshToken;

