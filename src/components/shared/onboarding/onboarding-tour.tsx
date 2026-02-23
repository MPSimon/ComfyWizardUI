"use client";

import { useEffect, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import type { OnboardingStep } from "@/components/shared/onboarding/onboarding-types";

type OnboardingTourProps = {
  open: boolean;
  step: OnboardingStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onDone: () => void;
  onMissingTarget: () => void;
};

export function OnboardingTour({
  open,
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onDone,
  onMissingTarget,
}: OnboardingTourProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const targetRect = useMemo(() => {
    if (!open || typeof window === "undefined") return null;
    const el = document.querySelector(step.target);
    if (!el) return null;
    return el.getBoundingClientRect();
  }, [open, step.target]);

  useEffect(() => {
    if (!open || targetRect) return;
    const timer = window.setTimeout(onMissingTarget, 180);
    return () => window.clearTimeout(timer);
  }, [open, targetRect, onMissingTarget]);

  useEffect(() => {
    if (!open) return;

    const focusSelector = 'button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onSkip();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        if (stepIndex === totalSteps - 1) {
          onDone();
        } else {
          onNext();
        }
      }

      if (event.key === "Tab" && panelRef.current) {
        const controls = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusSelector));
        if (controls.length === 0) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onDone, onNext, onSkip, stepIndex, totalSteps]);

  if (!open || !targetRect) return null;

  const isLast = stepIndex === totalSteps - 1;
  const tooltipWidth = 340;
  const left = Math.max(16, Math.min(targetRect.left, window.innerWidth - tooltipWidth - 16));
  const top = Math.min(targetRect.bottom + 12, window.innerHeight - 220);

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/65" />
      <div
        className="pointer-events-none absolute rounded-xl border-2 border-amber-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
        style={{
          left: targetRect.left - 6,
          top: targetRect.top - 6,
          width: targetRect.width + 12,
          height: targetRect.height + 12,
        }}
      />

      <div
        ref={panelRef}
        className="absolute w-[340px] rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-zinc-100 shadow-2xl"
        style={{ left, top }}
      >
        <p className="text-xs uppercase tracking-wide text-zinc-400">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
        <p className="mt-2 text-sm text-zinc-300">{step.body}</p>

        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSkip}>
            Skip
          </Button>
          <Button variant="ghost" size="sm" onClick={onPrev} disabled={stepIndex === 0}>
            Previous
          </Button>
          {isLast ? (
            <Button size="sm" className="ml-auto" onClick={onDone}>
              Finish
            </Button>
          ) : (
            <Button size="sm" className="ml-auto" onClick={onNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
