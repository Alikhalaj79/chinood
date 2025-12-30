import mongoose from "mongoose";

// Lightweight wrapper for connecting mongoose within the app.
export async function connectDB() {
  // If mongoose already connected, return the existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (mongoose.connection.readyState === 2) {
    // Connecting state - wait for connection
    await new Promise((resolve, reject) => {
      mongoose.connection.once("connected", resolve);
      mongoose.connection.once("error", reject);
      setTimeout(() => reject(new Error("Connection timeout")), 30000);
    });
    return mongoose.connection;
  }

  // Connect to MongoDB with proper error handling
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    // Disable buffering to prevent timeout errors
    mongoose.set("bufferCommands", false);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000, // 30 seconds for production
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    
    // Wait for connection to be fully established
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        mongoose.connection.once("connected", resolve);
        mongoose.connection.once("error", reject);
        setTimeout(() => reject(new Error("Connection timeout")), 5000);
      });
    }
    
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
