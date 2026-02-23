"use client";

import { useMemo, useState } from "react";

import { FilterBar } from "@/components/shared/filter-bar";
import { WorkflowCard } from "@/components/shared/workflow-card";
import type { WorkflowListItem } from "@/lib/types/workflow";

type GalleryShellProps = {
  workflows: WorkflowListItem[];
  hrefBase: string;
  heading: string;
  subheading: string;
  emphasizeImage?: boolean;
};

export function GalleryShell({
  workflows,
  hrefBase,
  heading,
  subheading,
  emphasizeImage = false,
}: GalleryShellProps) {
  const [filtered, setFiltered] = useState(workflows);

  const totalLabel = useMemo(
    () => `${filtered.length} workflow${filtered.length === 1 ? "" : "s"}`,
    [filtered.length],
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{heading}</h1>
        <p className="max-w-3xl text-muted-foreground">{subheading}</p>
      </div>

      <FilterBar workflows={workflows} onChange={(_, next) => setFiltered(next)} />

      <div className="mt-6 text-sm text-muted-foreground">{totalLabel}</div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No workflows match your filters.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              hrefBase={hrefBase}
              emphasizeImage={emphasizeImage}
            />
          ))}
        </div>
      )}
    </section>
  );
}
