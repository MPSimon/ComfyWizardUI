"use client";

import { Button } from "@/components/ui/button";
import type { OnboardingStep } from "@/components/shared/onboarding/onboarding-types";

type OnboardingMobileSheetProps = {
  open: boolean;
  step: OnboardingStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onDone: () => void;
};

export function OnboardingMobileSheet({
  open,
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onDone,
}: OnboardingMobileSheetProps) {
  if (!open) return null;

  const isLast = stepIndex === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-[90] bg-black/60">
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-100 shadow-2xl">
        <p className="text-xs uppercase tracking-wide text-zinc-400">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
        <p className="mt-2 text-sm text-zinc-300">{step.body}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
            onClick={onSkip}
          >
            Skip
          </Button>
          {isLast ? (
            <Button onClick={onDone}>Finish</Button>
          ) : (
            <Button onClick={onNext}>Next</Button>
          )}
        </div>

        <div className="mt-2 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={stepIndex === 0}
            className="text-zinc-300"
          >
            Previous
          </Button>
        </div>
      </div>
    </div>
  );
}
