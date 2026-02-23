import { redirect } from "next/navigation";

export default function WaitlistInstallPage() {
  redirect("/waitlist?funnel=install");
}
