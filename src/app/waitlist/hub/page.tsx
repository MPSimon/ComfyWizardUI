import { redirect } from "next/navigation";

export default function WaitlistHubPage() {
  redirect("/waitlist?funnel=hub");
}
