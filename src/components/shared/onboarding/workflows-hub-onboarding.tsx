"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { trackGaWaitlistEvent } from "@/lib/analytics";
import { getOnboardingState, setOnboardingSeen } from "@/lib/onboarding/storage";

export function WorkflowsHubOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  const trackedOpenRef = useRef(false);
  const isOpen = useMemo(() => {
    const shouldOpen = searchParams.get("tour") === "1";
    const state = getOnboardingState();
    return shouldOpen && !state.completed && !dismissed;
  }, [dismissed, searchParams]);

  const targetRect = useMemo(() => {
    if (!isOpen || typeof window === "undefined") return null;
    const el = document.querySelector('[data-tour="hub-sample-card"]');
    if (!el) return null;
    return el.getBoundingClientRect();
  }, [isOpen]);

  async function track(
    name: "tour_started" | "tour_step_viewed" | "tour_skipped" | "tour_reopened_help",
    metadata?: Record<string, string>,
  ) {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, funnelId: "hub", metadata }),
    });
    trackGaWaitlistEvent(name, "hub", metadata);
  }

  useEffect(() => {
    if (!isOpen || trackedOpenRef.current) return;
    trackedOpenRef.current = true;
    setOnboardingSeen();
    void track("tour_started", { step_id: "select-sample-workflow", tour_id: "sample-workflow" });
    void track("tour_step_viewed", { step_id: "select-sample-workflow", tour_id: "sample-workflow" });
  }, [isOpen]);

  if (!isOpen || !targetRect) return null;

  const tooltipWidth = 360;
  const left = Math.max(16, Math.min(targetRect.left, window.innerWidth - tooltipWidth - 16));
  const top = Math.min(targetRect.bottom + 12, window.innerHeight - 220);

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/35" />
      <div
        className="pointer-events-none absolute rounded-xl border-2 border-amber-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.28)]"
        style={{
          left: targetRect.left - 6,
          top: targetRect.top - 6,
          width: targetRect.width + 12,
          height: targetRect.height + 12,
        }}
      />

      <div
        className="absolute w-[360px] rounded-xl border border-zinc-700 bg-zinc-900/95 p-4 text-zinc-100 shadow-2xl"
        style={{ left, top }}
      >
        <p className="text-xs uppercase tracking-wide text-zinc-400">Step 1 of 4</p>
        <h3 className="mt-1 text-base font-semibold">Select the sample workflow</h3>
        <p className="mt-2 text-sm text-zinc-300">
          Start here. Open this sample listing and the guide will continue with dependencies and install actions.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
            onClick={() => {
              setDismissed(true);
              void track("tour_skipped", { step_id: "select-sample-workflow", tour_id: "sample-workflow" });
            }}
          >
            Skip
          </Button>
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => {
              setDismissed(true);
              router.push("/workflow/sample?tour=1");
            }}
          >
            Open sample
          </Button>
        </div>
      </div>
    </div>
  );
}
