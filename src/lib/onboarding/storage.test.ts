import { afterEach, describe, expect, test } from "vitest";

import {
  getOnboardingState,
  resetOnboardingState,
  setOnboardingCompleted,
  setOnboardingSeen,
} from "@/lib/onboarding/storage";

describe("onboarding storage", () => {
  afterEach(() => {
    resetOnboardingState();
  });

  test("defaults to not seen and not completed", () => {
    const state = getOnboardingState();
    expect(state.seen).toBe(false);
    expect(state.completed).toBe(false);
  });

  test("stores seen and completed flags", () => {
    setOnboardingSeen();
    setOnboardingCompleted();

    const state = getOnboardingState();
    expect(state.seen).toBe(true);
    expect(state.completed).toBe(true);
  });

  test("reset clears state", () => {
    setOnboardingSeen();
    setOnboardingCompleted();
    resetOnboardingState();

    const state = getOnboardingState();
    expect(state.seen).toBe(false);
    expect(state.completed).toBe(false);
  });
});
