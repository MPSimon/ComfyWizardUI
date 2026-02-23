import { WaitlistOnepageAlt } from "@/components/shared/waitlist-onepage-alt";
import { getDashboardMetrics } from "@/lib/waitlist-store";
import type { WaitlistFunnelId } from "@/lib/types/waitlist";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ComfyWizard Waitlist",
  description: "Join the ComfyWizard early access waitlist.",
};

type WaitlistPageProps = {
  searchParams: Promise<{ funnel?: string }>;
};

export default async function WaitlistPage({ searchParams }: WaitlistPageProps) {
  const params = await searchParams;
  const metrics = await getDashboardMetrics();
  const funnelId: WaitlistFunnelId = params.funnel === "hub" ? "hub" : "install";

  return <WaitlistOnepageAlt totalSignups={metrics.totals.signups} funnelId={funnelId} />;
}
