import type { WaitlistEventName, WaitlistFunnelId } from "@/lib/types/waitlist";

type WaitlistEventMetadata = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
} & Record<string, string | undefined>;

type GtagEventParams = {
  funnel_id: WaitlistFunnelId;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
} & Record<string, string | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params?: GtagEventParams) => void;
  }
}

export function trackGaWaitlistEvent(
  eventName: WaitlistEventName,
  funnelId: WaitlistFunnelId,
  metadata?: WaitlistEventMetadata,
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, {
    funnel_id: funnelId,
    utm_source: metadata?.utmSource ?? "",
    utm_medium: metadata?.utmMedium ?? "",
    utm_campaign: metadata?.utmCampaign ?? "",
    utm_content: metadata?.utmContent ?? "",
    step_id: metadata?.step_id ?? "",
    tour_id: metadata?.tour_id ?? "",
  });
}
