import { NextResponse } from "next/server";
import { connectDB } from "../../../api/data/index.js";
import mongoose from "mongoose";

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { ok: false, connected: false, error: "MONGODB_URI is not set" },
      { status: 400 }
    );
  }
  try {
    await connectDB();

    // Use mongoose.connection directly which is always available after connectDB()
    const isConnected = mongoose.connection.readyState === 1;
    
    let dbName = null;
    try {
      if (mongoose.connection.db) {
        dbName = mongoose.connection.db.databaseName;
      }
    } catch (err) {
      // ignore
    }

    return NextResponse.json({
      ok: true,
      connected: !!isConnected,
      database: dbName,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, connected: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
