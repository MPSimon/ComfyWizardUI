export type WaitlistFunnelId = "install" | "hub";

export type WaitlistRole = "creator" | "user";
export type WaitlistStack = "local" | "runpod" | "other";

export type WaitlistSignup = {
  id: string;
  email: string;
  role: WaitlistRole;
  stack: WaitlistStack;
  funnelId: WaitlistFunnelId;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  createdAt: string;
  discordActivatedAt?: string;
};

export type WaitlistEventName =
  | "lp_view"
  | "cta_waitlist_click"
  | "waitlist_signup_submitted"
  | "discord_join_clicked"
  | "install_intent_clicked"
  | "tour_started"
  | "tour_step_viewed"
  | "tour_completed"
  | "tour_skipped"
  | "tour_reopened_help";

export type WaitlistEvent = {
  id: string;
  name: WaitlistEventName;
  funnelId: WaitlistFunnelId;
  metadata?: Record<string, string>;
  createdAt: string;
};

export type WaitlistDashboardMetrics = {
  totals: {
    signups: number;
    discordActivated: number;
    events: number;
  };
  byFunnel: Record<WaitlistFunnelId, {
    signups: number;
    discordActivated: number;
    lpViews: number;
    ctaClicks: number;
    signupSubmits: number;
    discordJoinClicks: number;
    installIntentClicks: number;
  }>;
  byRole: Record<WaitlistRole, number>;
  byStack: Record<WaitlistStack, number>;
};
