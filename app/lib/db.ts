import mongoose from "mongoose";
import connect from "../../utils/connectedDB";

// Lightweight wrapper for connecting mongoose within the app.
// Uses existing utils/connectedDB.js to keep behavior consistent.
export async function connectDB() {
  // If mongoose already connected, return the existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Call the existing helper; it calls mongoose.connect internally.
  await connect();
  return mongoose.connection;
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
