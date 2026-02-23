import { redirect } from "next/navigation";

export default function WaitlistHubPage() {
  redirect("/waitlist/alt?funnel=hub");
}
