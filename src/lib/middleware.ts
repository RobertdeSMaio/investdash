import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./auth";

export function getAuthUser(req: NextRequest): string | null {
  try {
    const header = req.headers.get("authorization") || "";
    if (!header.startsWith("Bearer ")) return null;
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    return payload.sub;
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): { userId: string } | NextResponse {
  const userId = getAuthUser(req);
  if (!userId) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }
  return { userId };
}

/** Rate limiting via in-memory store (resets on cold start – adequate for serverless edge) */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= limit) return false; // blocked

  entry.count++;
  return true;
}

/** Helper: OPTIONS preflight */
export function preflight() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
  });
}
