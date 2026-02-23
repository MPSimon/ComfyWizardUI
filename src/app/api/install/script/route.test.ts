import { describe, expect, test } from "vitest";

import { GET } from "@/app/api/install/script/route";

describe("GET /api/install/script", () => {
  test("returns installer script text", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");

    const text = await response.text();
    expect(text).toContain("--workflow <slug>");
    expect(text).toContain("schemaVersion");
    expect(text).toContain("exit 2");
  });
});
