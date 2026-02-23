import { NextResponse } from "next/server";

import { getClientIp } from "@/lib/request";
import { checkRateLimit } from "@/lib/rate-limit";
import { trackEventWithMetadata } from "@/lib/waitlist-store";
import type { WaitlistEventName, WaitlistFunnelId } from "@/lib/types/waitlist";

const EVENT_NAMES: WaitlistEventName[] = [
  "lp_view",
  "cta_waitlist_click",
  "waitlist_signup_submitted",
  "discord_join_clicked",
  "install_intent_clicked",
];

const FUNNELS: WaitlistFunnelId[] = ["install", "hub"];

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`track:${ip}`, { limit: 120, windowMs: 60 * 1000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = (await request.json()) as Partial<{
    name: WaitlistEventName;
    funnelId: WaitlistFunnelId;
    metadata: Record<string, string>;
  }>;

  if (!body.name || !EVENT_NAMES.includes(body.name)) {
    return NextResponse.json({ error: "Invalid event name" }, { status: 400 });
  }

  if (!body.funnelId || !FUNNELS.includes(body.funnelId)) {
    return NextResponse.json({ error: "Invalid funnel" }, { status: 400 });
  }

  await trackEventWithMetadata(body.name, body.funnelId, body.metadata);
  return NextResponse.json({ ok: true });
}
