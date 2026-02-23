"use client";

import { OnboardingProvider } from "@/components/shared/onboarding/onboarding-provider";
import type { OnboardingStep } from "@/components/shared/onboarding/onboarding-types";

const SAMPLE_TOUR_STEPS: OnboardingStep[] = [
  {
    id: "sample-overview",
    title: "Start with the workflow overview",
    body: "Read the title and description, then quickly verify the preview so you know this is the right workflow before installing.",
    target: '[data-tour="sample-overview"]',
  },
  {
    id: "dependencies",
    title: "Check dependencies",
    body: "These are the exact files required to run the workflow correctly in ComfyUI.",
    target: '[data-tour="dependencies"]',
  },
  {
    id: "install-actions",
    title: "Install and run",
    body: "Copy the command, run it in your pod terminal, then use the RunPod template link and generate in ComfyUI.",
    target: '[data-tour="install-actions"]',
  },
];

type SampleWorkflowOnboardingProps = {
  children: React.ReactNode;
};

export function SampleWorkflowOnboarding({ children }: SampleWorkflowOnboardingProps) {
  return (
    <OnboardingProvider
      tourId="sample-workflow"
      steps={SAMPLE_TOUR_STEPS}
      funnelId="hub"
      autoStartOnFirstVisit={false}
    >
      {children}
    </OnboardingProvider>
  );
}
