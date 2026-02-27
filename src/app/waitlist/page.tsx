import { WaitlistOnepageAlt } from "@/components/shared/waitlist-onepage-alt";
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
  const funnelId: WaitlistFunnelId = params.funnel === "hub" ? "hub" : "install";

  return <WaitlistOnepageAlt funnelId={funnelId} />;
}
