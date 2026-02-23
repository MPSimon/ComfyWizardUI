"use client";

import { OnboardingProvider } from "@/components/shared/onboarding/onboarding-provider";
import type { OnboardingStep } from "@/components/shared/onboarding/onboarding-types";

const SAMPLE_TOUR_STEPS: OnboardingStep[] = [
  {
    id: "sample-title",
    title: "This is the sample workflow",
    body: "Start here to understand the full install-ready flow before trying other listings.",
    target: '[data-tour="sample-title"]',
  },
  {
    id: "dependencies",
    title: "Check dependencies first",
    body: "These are the exact files you need in ComfyUI before the workflow can run correctly.",
    target: '[data-tour="dependencies"]',
  },
  {
    id: "quickstart-command",
    title: "Copy the install command",
    body: "Run this command in your RunPod terminal. It fetches workflow assets and installs them to the right folders.",
    target: '[data-tour="quickstart-command"]',
  },
  {
    id: "runpod-template",
    title: "Launch a RunPod template",
    body: "Open this template, paste the command, then load the workflow in ComfyUI and generate.",
    target: '[data-tour="runpod-template"]',
  },
];

type SampleWorkflowOnboardingProps = {
  children: React.ReactNode;
};

export function SampleWorkflowOnboarding({ children }: SampleWorkflowOnboardingProps) {
  return (
    <OnboardingProvider tourId="sample-workflow" steps={SAMPLE_TOUR_STEPS} funnelId="hub">
      {children}
    </OnboardingProvider>
  );
}
