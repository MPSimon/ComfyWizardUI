"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { OnboardingMobileSheet } from "@/components/shared/onboarding/onboarding-mobile-sheet";
import { OnboardingTour } from "@/components/shared/onboarding/onboarding-tour";
import type { OnboardingStep, OnboardingTourId } from "@/components/shared/onboarding/onboarding-types";
import { trackGaWaitlistEvent } from "@/lib/analytics";
import { getOnboardingState, setOnboardingCompleted, setOnboardingSeen } from "@/lib/onboarding/storage";
import type { WaitlistFunnelId } from "@/lib/types/waitlist";

type OnboardingProviderProps = {
  tourId: OnboardingTourId;
  steps: OnboardingStep[];
  funnelId?: WaitlistFunnelId;
  autoStartOnFirstVisit?: boolean;
  children: React.ReactNode;
};

type TourOpenEvent = CustomEvent<{ tourId: OnboardingTourId }>;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return isMobile;
}

export function OnboardingProvider({
  tourId,
  steps,
  children,
  funnelId = "hub",
  autoStartOnFirstVisit = true,
}: OnboardingProviderProps) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const safeSteps = useMemo(
    () => (steps.length > 0 ? steps : [{ id: "empty", title: "Welcome", body: "", target: "body" }]),
    [steps],
  );
  const step = useMemo(
    () => safeSteps[Math.min(stepIndex, safeSteps.length - 1)],
    [safeSteps, stepIndex],
  );

  async function track(
    name: "tour_started" | "tour_step_viewed" | "tour_completed" | "tour_skipped" | "tour_reopened_help",
    metadata?: Record<string, string>,
  ) {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, funnelId, metadata }),
    });
    trackGaWaitlistEvent(name, funnelId, metadata);
  }

  function openTour(manual: boolean) {
    setStepIndex(0);
    setOpen(true);
    setOnboardingSeen();
    void track(manual ? "tour_reopened_help" : "tour_started", {
      step_id: safeSteps[0].id,
      tour_id: tourId,
    });
  }

  useEffect(() => {
    const forceOpen = searchParams.get("tour") === "1";
    const state = getOnboardingState();
    if (forceOpen) {
      openTour(true);
      return;
    }
    if (autoStartOnFirstVisit && !state.seen) {
      openTour(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartOnFirstVisit, searchParams]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as TourOpenEvent;
      if (customEvent.detail?.tourId !== tourId) return;
      openTour(true);
    };
    window.addEventListener("cw:open-tour", handler as EventListener);
    return () => window.removeEventListener("cw:open-tour", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  useEffect(() => {
    if (!open) return;
    void track("tour_step_viewed", { step_id: step.id, tour_id: tourId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step.id, stepIndex, tourId]);

  function closeAsSkipped() {
    setOpen(false);
    void track("tour_skipped", {
      step_id: step.id,
      tour_id: tourId,
    });
  }

  function nextStep() {
    if (stepIndex >= safeSteps.length - 1) {
      setOnboardingCompleted();
      setOpen(false);
      void track("tour_completed", { tour_id: tourId });
      return;
    }
    setStepIndex((prev) => prev + 1);
  }

  function prevStep() {
    setStepIndex((prev) => Math.max(0, prev - 1));
  }

  return (
    <>
      {children}
      {isMobile ? (
        <OnboardingMobileSheet
          open={open}
          step={step}
          stepIndex={stepIndex}
          totalSteps={safeSteps.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={closeAsSkipped}
          onDone={nextStep}
        />
      ) : (
        <OnboardingTour
          open={open}
          step={step}
          stepIndex={stepIndex}
          totalSteps={safeSteps.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={closeAsSkipped}
          onDone={nextStep}
          onMissingTarget={nextStep}
        />
      )}
    </>
  );
}
