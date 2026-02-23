"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trackGaWaitlistEvent } from "@/lib/analytics";
import type {
  WaitlistEventName,
  WaitlistFunnelId,
  WaitlistRole,
  WaitlistStack,
} from "@/lib/types/waitlist";

type WaitlistFormProps = {
  funnelId: WaitlistFunnelId;
  discordInviteUrl: string;
  showInstallIntent: boolean;
  title?: string;
  theme?: "light" | "dark";
  autoFocusEmail?: boolean;
  trackLpView?: boolean;
};

async function track(name: WaitlistEventName, funnelId: WaitlistFunnelId) {
  const params = new URLSearchParams(window.location.search);
  const metadata = {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    utmContent: params.get("utm_content") ?? "",
  };

  await fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, funnelId, metadata }),
  });

  trackGaWaitlistEvent(name, funnelId, metadata);
}

export function WaitlistForm({
  funnelId,
  discordInviteUrl,
  showInstallIntent,
  title = "Join the waitlist",
  theme = "light",
  autoFocusEmail = false,
  trackLpView = true,
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WaitlistRole>("creator");
  const [stack, setStack] = useState<WaitlistStack>("runpod");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utm, setUtm] = useState({
    source: "",
    medium: "",
    campaign: "",
    content: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtm({
      source: params.get("utm_source") ?? "",
      medium: params.get("utm_medium") ?? "",
      campaign: params.get("utm_campaign") ?? "",
      content: params.get("utm_content") ?? "",
    });

    if (trackLpView) {
      void track("lp_view", funnelId);
    }
  }, [funnelId, trackLpView]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await track("cta_waitlist_click", funnelId);

      const response = await fetch("/api/waitlist/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          stack,
          funnelId,
          utmSource: utm.source,
          utmMedium: utm.medium,
          utmCampaign: utm.campaign,
          utmContent: utm.content,
        }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Could not submit signup");
      }

      trackGaWaitlistEvent("waitlist_signup_submitted", funnelId, {
        utmSource: utm.source,
        utmMedium: utm.medium,
        utmCampaign: utm.campaign,
        utmContent: utm.content,
      });
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong");
    }
  }

  async function markDiscordJoined() {
    await track("discord_join_clicked", funnelId);

    await fetch("/api/waitlist/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  }

  async function trackInstallIntent() {
    await track("install_intent_clicked", funnelId);
  }

  const dark = theme === "dark";

  const cardClass = dark
    ? "rounded-3xl border-zinc-700 bg-zinc-900/90 text-zinc-100"
    : "rounded-3xl border-border/70";

  const inputClass = dark
    ? "border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500"
    : "";

  const selectClass = dark
    ? "h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
    : "h-10 w-full rounded-md border bg-background px-3 text-sm";

  const primaryButtonClass = dark
    ? "w-full bg-amber-400 text-black hover:bg-amber-300"
    : "w-full";

  const secondaryButtonClass = dark
    ? "w-full border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
    : "w-full";

  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle className={dark ? "text-amber-300" : undefined}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!submitted ? (
          <form className="space-y-4" onSubmit={submit}>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              autoFocus={autoFocusEmail}
              placeholder="you@example.com"
              className={inputClass}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Role</span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as WaitlistRole)}
                  className={selectClass}
                >
                  <option value="creator">Creator</option>
                  <option value="user">User</option>
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Current stack</span>
                <select
                  value={stack}
                  onChange={(event) => setStack(event.target.value as WaitlistStack)}
                  className={selectClass}
                >
                  <option value="runpod">RunPod</option>
                  <option value="local">Local</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button className={primaryButtonClass} type="submit">
              Join waitlist
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are in. Next step: join Discord and post your setup pain in onboarding.
            </p>

            <Button asChild className={primaryButtonClass} onClick={markDiscordJoined}>
              <a href={discordInviteUrl} target="_blank" rel="noreferrer">
                Join Discord onboarding
              </a>
            </Button>

            {showInstallIntent ? (
              <Button
                variant="outline"
                className={secondaryButtonClass}
                onClick={trackInstallIntent}
                asChild
              >
                <Link href="/workflows">I want 1-click install first</Link>
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
