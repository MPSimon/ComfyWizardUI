import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";

import type {
  WaitlistDashboardMetrics,
  WaitlistEvent,
  WaitlistEventName,
  WaitlistFunnelId,
  WaitlistRole,
  WaitlistSignup,
  WaitlistStack,
} from "@/lib/types/waitlist";

type WaitlistStore = {
  signups: WaitlistSignup[];
  events: WaitlistEvent[];
};

const DATA_DIR = process.env.WAITLIST_DATA_DIR ?? path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "waitlist-store.json");
const STORE_KEY = process.env.WAITLIST_STORE_KEY ?? "comfywizard:waitlist:store";
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const EMPTY_STORE: WaitlistStore = { signups: [], events: [] };
let redisClient: Redis | null | undefined;

function getRedisClient() {
  if (redisClient !== undefined) {
    return redisClient;
  }

  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });
  return redisClient;
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function readStore(): Promise<WaitlistStore> {
  const redis = getRedisClient();
  if (redis) {
    const parsed = await redis.get<Partial<WaitlistStore>>(STORE_KEY);
    return {
      signups: Array.isArray(parsed?.signups) ? parsed.signups : [],
      events: Array.isArray(parsed?.events) ? parsed.events : [],
    };
  }

  ensureDataDir();
  if (!existsSync(STORE_FILE)) return EMPTY_STORE;

  try {
    const raw = readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<WaitlistStore>;
    return {
      signups: Array.isArray(parsed.signups) ? parsed.signups : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch {
    return EMPTY_STORE;
  }
}

async function writeStore(next: WaitlistStore) {
  const redis = getRedisClient();
  if (redis) {
    await redis.set(STORE_KEY, next);
    return;
  }

  ensureDataDir();
  const tempFile = `${STORE_FILE}.tmp`;
  writeFileSync(tempFile, JSON.stringify(next, null, 2), "utf8");
  renameSync(tempFile, STORE_FILE);
}

export async function trackEvent(name: WaitlistEventName, funnelId: WaitlistFunnelId) {
  await trackEventWithMetadata(name, funnelId);
}

export async function trackEventWithMetadata(
  name: WaitlistEventName,
  funnelId: WaitlistFunnelId,
  metadata?: Record<string, string>,
) {
  const current = await readStore();
  current.events.push({
    id: randomUUID(),
    name,
    funnelId,
    metadata,
    createdAt: new Date().toISOString(),
  });
  await writeStore(current);
}

export async function createSignup(input: {
  email: string;
  role: WaitlistRole;
  stack: WaitlistStack;
  funnelId: WaitlistFunnelId;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}) {
  const current = await readStore();
  const email = input.email.trim().toLowerCase();
  const existing = current.signups.find((signup) => signup.email === email);

  if (existing) {
    return existing;
  }

  const signup: WaitlistSignup = {
    id: randomUUID(),
    email,
    role: input.role,
    stack: input.stack,
    funnelId: input.funnelId,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    utmContent: input.utmContent,
    createdAt: new Date().toISOString(),
  };

  current.signups.push(signup);
  await writeStore(current);
  return signup;
}

export async function activateDiscord(email: string) {
  const current = await readStore();
  const normalized = email.trim().toLowerCase();
  const signup = current.signups.find((item) => item.email === normalized);

  if (!signup) {
    return null;
  }

  if (!signup.discordActivatedAt) {
    signup.discordActivatedAt = new Date().toISOString();
    await writeStore(current);
  }

  return signup;
}

function countEventsByName(
  events: WaitlistEvent[],
  name: WaitlistEventName,
  funnelId: WaitlistFunnelId,
) {
  return events.filter((event) => event.name === name && event.funnelId === funnelId).length;
}

export async function getDashboardMetrics(): Promise<WaitlistDashboardMetrics> {
  const { signups, events } = await readStore();

  const funnels: WaitlistFunnelId[] = ["install", "hub"];
  const roles: WaitlistRole[] = ["creator", "user"];
  const stacks: WaitlistStack[] = ["local", "runpod", "other"];

  const byFunnel = funnels.reduce((acc, funnel) => {
    const funnelSignups = signups.filter((signup) => signup.funnelId === funnel);
    acc[funnel] = {
      signups: funnelSignups.length,
      discordActivated: funnelSignups.filter((signup) => Boolean(signup.discordActivatedAt)).length,
      lpViews: countEventsByName(events, "lp_view", funnel),
      ctaClicks: countEventsByName(events, "cta_waitlist_click", funnel),
      signupSubmits: countEventsByName(events, "waitlist_signup_submitted", funnel),
      discordJoinClicks: countEventsByName(events, "discord_join_clicked", funnel),
      installIntentClicks: countEventsByName(events, "install_intent_clicked", funnel),
    };
    return acc;
  }, {} as WaitlistDashboardMetrics["byFunnel"]);

  const byRole = roles.reduce((acc, role) => {
    acc[role] = signups.filter((signup) => signup.role === role).length;
    return acc;
  }, {} as WaitlistDashboardMetrics["byRole"]);

  const byStack = stacks.reduce((acc, stack) => {
    acc[stack] = signups.filter((signup) => signup.stack === stack).length;
    return acc;
  }, {} as WaitlistDashboardMetrics["byStack"]);

  return {
    totals: {
      signups: signups.length,
      discordActivated: signups.filter((signup) => Boolean(signup.discordActivatedAt)).length,
      events: events.length,
    },
    byFunnel,
    byRole,
    byStack,
  };
}
