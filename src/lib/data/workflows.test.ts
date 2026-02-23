import { describe, expect, it } from "vitest";

import { getWorkflowBySlug, getWorkflowList } from "@/lib/data/workflows";

describe("workflows data adapter", () => {
  it("returns workflow list with derived dependency counts", async () => {
    const list = await getWorkflowList();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty("dependencyCounts.required");
    expect(list[0]).toHaveProperty("dependencyCounts.optional");
  });

  it("returns null for unknown workflow slug", async () => {
    const detail = await getWorkflowBySlug("does-not-exist");
    expect(detail).toBeNull();
  });

  it("splits required and optional dependencies on detail", async () => {
    const detail = await getWorkflowBySlug("sample");
    expect(detail).not.toBeNull();
    expect(detail?.dependenciesRequired.every((dep) => dep.required)).toBe(true);
    expect(detail?.dependenciesOptional.every((dep) => !dep.required)).toBe(true);
  });
});
