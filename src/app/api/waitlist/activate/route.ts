import { NextResponse } from "next/server";

import { activateDiscord } from "@/lib/waitlist-store";
import { getClientIp } from "@/lib/request";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`activate:${ip}`, { limit: 30, windowMs: 15 * 60 * 1000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = (await request.json()) as Partial<{ email: string }>;

  if (!body.email || !body.email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const signup = await activateDiscord(body.email);
  if (!signup) {
    return NextResponse.json({ error: "Signup not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    activatedAt: signup.discordActivatedAt,
  });
}
