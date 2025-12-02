import { NextResponse } from "next/server";
import { connectDB } from "../../../api/data/index.js";

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { ok: false, connected: false, error: "MONGODB_URI is not set" },
      { status: 400 }
    );
  }
  try {
    const conn = await connectDB();

    // conn may return mongoose connection object; attempt to get db info
    const isConnected =
      !!(conn && conn.connection) || !!(conn && conn.readyState !== undefined);
    let dbName = null;
    try {
      dbName =
        conn &&
        conn.connection &&
        conn.connection.db &&
        conn.connection.db.databaseName;
      if (!dbName && conn && conn.db && conn.db.databaseName)
        dbName = conn.db.databaseName;
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
