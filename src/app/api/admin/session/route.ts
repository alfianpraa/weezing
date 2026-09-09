import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return NextResponse.json({ authenticated: isAdminRequest(request) });
}
