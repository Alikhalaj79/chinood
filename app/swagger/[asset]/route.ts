import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import swaggerUiDist from "swagger-ui-dist";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ asset: string }> }
) {
  try {
    const { asset } = await params; // e.g., 'swagger-ui.css' or 'swagger-ui-bundle.js'
    
    // Security: Only allow specific swagger-ui files
    const allowedAssets = [
      'swagger-ui.css',
      'swagger-ui-bundle.js',
      'swagger-ui-standalone-preset.js',
      'swagger-ui.css.map',
      'swagger-ui-bundle.js.map',
      'swagger-ui-standalone-preset.js.map'
    ];
    
    if (!allowedAssets.includes(asset)) {
      return new NextResponse("Not found", { status: 404 });
    }
    
    const distPath = swaggerUiDist.getAbsoluteFSPath();
    const filePath = path.join(distPath, asset);
    
    if (!fs.existsSync(filePath)) {
      console.error("Swagger asset not found:", filePath);
      return new NextResponse("Not found", { status: 404 });
    }
    
    const contents = fs.readFileSync(filePath);
    const ext = path.extname(asset).slice(1);
    const contentType =
      ext === "css"
        ? "text/css"
        : ext === "js"
        ? "application/javascript"
        : ext === "map"
        ? "application/json"
        : "application/octet-stream";
    
    return new NextResponse(contents, {
      headers: { 
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      },
    });
  } catch (err) {
    console.error("Failed to serve swagger asset", err);
    return new NextResponse("Not found", { status: 404 });
  }
}
