import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ComfyWizardUI Waitlist",
  description: "Join the ComfyWizardUI early access waitlist.",
};

type WaitlistPageProps = {
  searchParams: Promise<{ funnel?: string }>;
};

export default async function WaitlistPage({ searchParams }: WaitlistPageProps) {
  const params = await searchParams;
  const funnel = params.funnel === "hub" ? "hub" : "install";

  redirect(`/waitlist/alt?funnel=${funnel}`);
}
