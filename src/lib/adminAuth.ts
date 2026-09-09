import "server-only";
import crypto from "node:crypto";

export const ADMIN_COOKIE_NAME = "weezing_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "ADMIN_PASSWORD environment variable is not set. Set it in your .env file to enable the admin area."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }

  const signatureBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (signatureBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(signatureBuf, expectedBuf)) return false;

  const expires = Number(payload);
  return Number.isFinite(expires) && Date.now() <= expires;
}

export function checkPassword(candidate: string): boolean {
  const secret = getSecret();
  const candidateBuf = Buffer.from(candidate);
  const secretBuf = Buffer.from(secret);
  if (candidateBuf.length !== secretBuf.length) return false;
  return crypto.timingSafeEqual(candidateBuf, secretBuf);
}

export function isAdminRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName === ADMIN_COOKIE_NAME) {
      return verifySessionToken(decodeURIComponent(rawValue.join("=")));
    }
  }
  return false;
}
