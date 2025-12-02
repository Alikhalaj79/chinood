import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, default: "user" },
});

export const User =
  (mongoose.models && mongoose.models.User) ||
  mongoose.model<IUser>("User", UserSchema);
export default User;
