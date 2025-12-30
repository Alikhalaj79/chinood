import mongoose from "mongoose";

// Lightweight wrapper for connecting mongoose within the app.
export async function connectDB() {
  // If mongoose already connected, return the existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Connect to MongoDB with proper error handling
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Increased timeout for production
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log("MongoDB connected successfully");
    return mongoose.connection;
  } catch (err: any) {
    console.error("Failed to connect to MongoDB:", err);
    console.error("MongoDB URI:", uri ? `${uri.substring(0, 20)}...` : "not set");
    throw err;
  }
}

export async function disconnectDB() {
  // In dev/production we don't generally disconnect per-request, but
  // helper is provided for scripts or tests that do.
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch (err) {
      // harmless — some callers prefer no throw here
      console.warn("disconnectDB error", err);
    }
  }
}

export default { connectDB, disconnectDB };
