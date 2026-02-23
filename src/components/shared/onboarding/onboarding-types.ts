export type OnboardingTourId = "sample-workflow";

export type OnboardingStep = {
  id: string;
  title: string;
  body: string;
  target: string;
};

export type OnboardingStorageState = {
  seen: boolean;
  completed: boolean;
};
