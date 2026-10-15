import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ai-hrms",
    timestamp: new Date().toISOString(),
  });
}
