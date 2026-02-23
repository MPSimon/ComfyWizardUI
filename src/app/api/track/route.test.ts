import { describe, expect, test } from "vitest";

import { POST } from "@/app/api/track/route";

describe("POST /api/track", () => {
  test("accepts tour event names", async () => {
    const request = new Request("http://localhost/api/track", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify({
        name: "tour_started",
        funnelId: "hub",
        metadata: { step_id: "sample-title", tour_id: "sample-workflow" },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
