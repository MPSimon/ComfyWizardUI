import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkflowCard } from "@/components/shared/workflow-card";

describe("WorkflowCard", () => {
  it("renders key workflow fields", () => {
    render(
      <WorkflowCard
        hrefBase=""
        workflow={{
          id: "wf-1",
          slug: "wan-portrait",
          title: "WAN Portrait",
          summary: "A portrait workflow",
          stack: "wan",
          coverImageUrl: "https://example.com/image.jpg",
          isVerified: true,
          dependencyCounts: { required: 2, optional: 1 },
          latestVersion: "1.0.0",
          updatedAt: "2026-02-20T00:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("WAN Portrait")).toBeInTheDocument();
    expect(screen.getByText("A portrait workflow")).toBeInTheDocument();
    expect(screen.getByText("Required dependencies: 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open workflow wan portrait/i })).toHaveAttribute(
      "href",
      "/workflow/wan-portrait",
    );
  });
});
