import type { OnboardingStorageState } from "@/components/shared/onboarding/onboarding-types";

const KEY_SEEN = "cw_onboarding_sample_seen";
const KEY_COMPLETED = "cw_onboarding_sample_completed";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function getOnboardingState(): OnboardingStorageState {
  if (!canUseStorage()) {
    return { seen: false, completed: false };
  }

  return {
    seen: window.localStorage.getItem(KEY_SEEN) === "1",
    completed: window.localStorage.getItem(KEY_COMPLETED) === "1",
  };
}

export function setOnboardingSeen() {
  if (!canUseStorage()) return;
  window.localStorage.setItem(KEY_SEEN, "1");
}

export function setOnboardingCompleted() {
  if (!canUseStorage()) return;
  window.localStorage.setItem(KEY_COMPLETED, "1");
}

export function resetOnboardingState() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(KEY_SEEN);
  window.localStorage.removeItem(KEY_COMPLETED);
}
