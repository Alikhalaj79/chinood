import mongoose from "mongoose";

// Export a helper to connect to the DB so code can import and call explicitly
// This makes testing and reuse easier while preserving the previous import-time
// behavior for app runtime.
export async function connectDB(
  uri = process.env.MONGODB_URI,
  options = { serverSelectionTimeoutMS: 5000 }
) {
  if (!uri) {
    // Keep the previous behavior (no error thrown), but warn instead.
    // Calling code can pass a URI directly if needed.
    console.warn("api/data/index.js: MONGODB_URI is not set");
  }

  // Do not re-create connection if already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, options);
    return conn;
  } catch (err) {
    // Rethrow so callers/tests can decide what to do; preserve stack.
    throw err;
  }
}

// Default behavior: connect on import unless caller wants to skip by setting
// SKIP_DB_CONNECT environment variable (useful in some tests or script contexts).
if (process.env.SKIP_DB_CONNECT !== "true") {
  connectDB().catch((err) =>
    console.error("Error connecting to MongoDB on import:", err.message || err)
  );
}
