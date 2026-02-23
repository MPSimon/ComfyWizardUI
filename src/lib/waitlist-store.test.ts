import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

function setupTempStoreDir() {
  const tempDir = mkdtempSync(path.join(tmpdir(), "cwui-waitlist-"));
  process.env.WAITLIST_DATA_DIR = tempDir;
  return tempDir;
}

async function loadStoreModule() {
  vi.resetModules();
  return import("@/lib/waitlist-store");
}

describe("waitlist store tracking", () => {
  beforeEach(() => {
    setupTempStoreDir();
  });

  afterEach(() => {
    delete process.env.WAITLIST_DATA_DIR;
  });

  test("stores signup with UTM fields", async () => {
    const { createSignup } = await loadStoreModule();

    await createSignup({
      email: "test@example.com",
      role: "creator",
      stack: "runpod",
      funnelId: "install",
      utmSource: "reddit",
      utmMedium: "social",
      utmCampaign: "launch",
      utmContent: "post-a",
    });

    const { getDashboardMetrics } = await loadStoreModule();
    const metrics = await getDashboardMetrics();
    expect(metrics.totals.signups).toBe(1);
    expect(metrics.byRole.creator).toBe(1);
    expect(metrics.byStack.runpod).toBe(1);
  });

  test("tracks all key events by funnel", async () => {
    const { trackEventWithMetadata, getDashboardMetrics } = await loadStoreModule();

    await trackEventWithMetadata("lp_view", "install", { utmSource: "x" });
    await trackEventWithMetadata("cta_waitlist_click", "install", { utmSource: "x" });
    await trackEventWithMetadata("waitlist_signup_submitted", "install", { utmSource: "x" });
    await trackEventWithMetadata("discord_join_clicked", "install", { utmSource: "x" });
    await trackEventWithMetadata("install_intent_clicked", "install", { utmSource: "x" });

    const metrics = await getDashboardMetrics();
    expect(metrics.byFunnel.install.lpViews).toBe(1);
    expect(metrics.byFunnel.install.ctaClicks).toBe(1);
    expect(metrics.byFunnel.install.signupSubmits).toBe(1);
    expect(metrics.byFunnel.install.discordJoinClicks).toBe(1);
    expect(metrics.byFunnel.install.installIntentClicks).toBe(1);
  });

  test("writes event metadata to store file", async () => {
    const waitlistDataDir = process.env.WAITLIST_DATA_DIR;
    if (!waitlistDataDir) {
      throw new Error("WAITLIST_DATA_DIR is not set");
    }

    const { trackEventWithMetadata } = await loadStoreModule();
    await trackEventWithMetadata("lp_view", "hub", {
      utmSource: "reddit",
      utmMedium: "social",
      utmCampaign: "alpha",
      utmContent: "thread-1",
    });

    const storePath = path.join(waitlistDataDir, "waitlist-store.json");
    const store = JSON.parse(readFileSync(storePath, "utf8")) as {
      events: Array<{ name: string; metadata?: Record<string, string> }>;
    };

    expect(store.events).toHaveLength(1);
    expect(store.events[0].name).toBe("lp_view");
    expect(store.events[0].metadata).toMatchObject({
      utmSource: "reddit",
      utmMedium: "social",
      utmCampaign: "alpha",
      utmContent: "thread-1",
    });
  });
});
