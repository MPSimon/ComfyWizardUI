import { describe, expect, it } from "vitest";

import { filterAndSortWorkflows } from "@/features/filters/workflow-filters";
import type { WorkflowListItem } from "@/lib/types/workflow";

const workflows: WorkflowListItem[] = [
  {
    id: "1",
    slug: "wan-a",
    title: "WAN Alpha",
    summary: "Portrait realism",
    stack: "wan",
    coverImageUrl: "https://example.com/a.jpg",
    isVerified: true,
    dependencyCounts: { required: 2, optional: 1 },
    latestVersion: "1.0.0",
    updatedAt: "2026-02-20T10:00:00.000Z",
  },
  {
    id: "2",
    slug: "qwen-b",
    title: "QWEN Beta",
    summary: "Product photography",
    stack: "qwen",
    coverImageUrl: "https://example.com/b.jpg",
    isVerified: false,
    dependencyCounts: { required: 1, optional: 0 },
    latestVersion: "1.0.0",
    updatedAt: "2026-02-10T10:00:00.000Z",
  },
];

describe("filterAndSortWorkflows", () => {
  it("filters by query on title or summary", () => {
    const result = filterAndSortWorkflows(workflows, { query: "portrait" });
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("wan-a");
  });

  it("filters by stack and verified flag together", () => {
    const result = filterAndSortWorkflows(workflows, {
      stack: "qwen",
      verifiedOnly: true,
    });
    expect(result).toHaveLength(0);
  });

  it("sorts title ascending when requested", () => {
    const result = filterAndSortWorkflows(workflows, { sort: "title_asc" });
    expect(result.map((item) => item.title)).toEqual(["QWEN Beta", "WAN Alpha"]);
  });
});
