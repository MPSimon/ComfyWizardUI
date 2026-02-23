import { NextResponse } from "next/server";

import { createSignup, trackEventWithMetadata } from "@/lib/waitlist-store";
import { getClientIp } from "@/lib/request";
import { checkRateLimit } from "@/lib/rate-limit";
import type { WaitlistFunnelId, WaitlistRole, WaitlistStack } from "@/lib/types/waitlist";

const ROLE_VALUES: WaitlistRole[] = ["creator", "user"];
const STACK_VALUES: WaitlistStack[] = ["local", "runpod", "other"];
const FUNNELS: WaitlistFunnelId[] = ["install", "hub"];

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{
    email: string;
    role: WaitlistRole;
    stack: WaitlistStack;
    funnelId: WaitlistFunnelId;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmContent: string;
  }>;

  const ip = getClientIp(request);
  const rate = checkRateLimit(`signup:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  if (!body.email || !body.email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  if (!body.role || !ROLE_VALUES.includes(body.role)) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  if (!body.stack || !STACK_VALUES.includes(body.stack)) {
    return NextResponse.json({ error: "Stack is required" }, { status: 400 });
  }

  if (!body.funnelId || !FUNNELS.includes(body.funnelId)) {
    return NextResponse.json({ error: "Funnel is required" }, { status: 400 });
  }

  const signup = await createSignup({
    email: body.email,
    role: body.role,
    stack: body.stack,
    funnelId: body.funnelId,
    utmSource: body.utmSource,
    utmMedium: body.utmMedium,
    utmCampaign: body.utmCampaign,
    utmContent: body.utmContent,
  });

  await trackEventWithMetadata("waitlist_signup_submitted", body.funnelId, {
    utmSource: body.utmSource ?? "",
    utmMedium: body.utmMedium ?? "",
    utmCampaign: body.utmCampaign ?? "",
    utmContent: body.utmContent ?? "",
  });

  return NextResponse.json({
    ok: true,
    signup: {
      email: signup.email,
      funnelId: signup.funnelId,
      createdAt: signup.createdAt,
    },
  });
}
