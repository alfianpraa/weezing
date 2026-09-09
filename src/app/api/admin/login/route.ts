import { NextResponse } from "next/server";
import { checkPassword, createSessionToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const password = body.password ?? "";
  let valid: boolean;
  try {
    valid = Boolean(password) && checkPassword(password);
  } catch {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD belum dikonfigurasi di server." },
      { status: 500 }
    );
  }

  if (!valid) {
    return NextResponse.json({ error: "Password salah." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
