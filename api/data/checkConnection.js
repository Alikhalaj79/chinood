import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "❌ MONGODB_URI is not set. Please set process.env.MONGODB_URI and try again."
    );
    process.exit(1);
  }

  console.log("ℹ️ Trying to connect to MongoDB...");

  // Set a quick server selection timeout to fail fast
  const options = { serverSelectionTimeoutMS: 5000 };

  try {
    const conn = await mongoose.connect(uri, options);
    console.log("✅ Connected to MongoDB.");
    try {
      // If mongoose has a connection object, show a few details
      const db =
        conn && conn.connection && conn.connection.db
          ? conn.connection.db
          : mongoose.connection.db;
      if (db) {
        console.log("  Database name:", db.databaseName);
        console.log("  Connection readyState:", mongoose.connection.readyState);
      }
    } catch (err) {
      console.error("Error inspecting DB connection:", err.message || err);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message || err);
    process.exit(2);
  }
}

main();
