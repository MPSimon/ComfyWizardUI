import { redirect } from "next/navigation";

type WaitlistAltPageProps = {
  searchParams: Promise<{ funnel?: string }>;
};

export default async function WaitlistAltPage({ searchParams }: WaitlistAltPageProps) {
  const params = await searchParams;
  const funnel = params.funnel === "hub" ? "hub" : "install";

  redirect(`/waitlist?funnel=${funnel}`);
}
