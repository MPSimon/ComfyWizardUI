import { describe, expect, test } from "vitest";

import { GET } from "@/app/api/install/workflows/[slug]/route";

describe("GET /api/install/workflows/[slug]", () => {
  test("returns sample manifest", async () => {
    const request = new Request("http://localhost/api/install/workflows/sample?version=1.0.0");
    const response = await GET(request, { params: Promise.resolve({ slug: "sample" }) });
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      schemaVersion: string;
      workflow: { slug: string; version: string };
      dependencies: unknown[];
    };

    expect(body.schemaVersion).toBe("1.0");
    expect(body.workflow.slug).toBe("sample");
    expect(body.workflow.version).toBe("1.0.0");
    expect(Array.isArray(body.dependencies)).toBe(true);
    expect(body.dependencies.length).toBeGreaterThan(0);
  });

  test("returns 404 for unknown slug", async () => {
    const request = new Request("http://localhost/api/install/workflows/unknown");
    const response = await GET(request, { params: Promise.resolve({ slug: "unknown" }) });
    expect(response.status).toBe(404);
  });

  test("returns 404 for unsupported version", async () => {
    const request = new Request("http://localhost/api/install/workflows/sample?version=9.9.9");
    const response = await GET(request, { params: Promise.resolve({ slug: "sample" }) });
    expect(response.status).toBe(404);
  });
});
