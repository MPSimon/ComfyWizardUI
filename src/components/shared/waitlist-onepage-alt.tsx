"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { motion } from "motion/react";

import { WaitlistForm } from "@/components/shared/waitlist-form";
import { Button } from "@/components/ui/button";
import { trackGaWaitlistEvent } from "@/lib/analytics";
import type { WaitlistFunnelId } from "@/lib/types/waitlist";

type WaitlistOnepageAltProps = {
  totalSignups: number;
  funnelId: WaitlistFunnelId;
};

export function WaitlistOnepageAlt({ totalSignups, funnelId }: WaitlistOnepageAltProps) {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const joinButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const launchSignal = totalSignups > 0 ? `${totalSignups} early users joined` : "Early access now open";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const metadata = {
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
      utmContent: params.get("utm_content") ?? "",
    };

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "lp_view", funnelId, metadata }),
    });

    trackGaWaitlistEvent("lp_view", funnelId, metadata);
  }, [funnelId]);

  useEffect(() => {
    if (!joinModalOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    const dialogEl = dialogRef.current;

    const focusSelector =
      'a[href],button:not([disabled]),textarea,input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const focusable = dialogEl ? Array.from(dialogEl.querySelectorAll<HTMLElement>(focusSelector)) : [];
    const emailInput = dialogEl?.querySelector<HTMLInputElement>('input[type="email"]');
    (emailInput ?? focusable[0])?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setJoinModalOpen(false);
        return;
      }

      if (event.key === "Tab" && dialogEl) {
        const items = Array.from(dialogEl.querySelectorAll<HTMLElement>(focusSelector));
        if (items.length === 0) return;

        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [joinModalOpen]);

  function closeJoinModal() {
    setJoinModalOpen(false);
    window.setTimeout(() => {
      joinButtonRef.current?.focus();
    }, 0);
  }

  const flowSteps = [
    {
      title: "Choose workflow",
      body: "Pick a workflow from the hub with required and optional dependencies clearly listed.",
    },
    {
      title: "Click install",
      body: "Use the install action to generate a setup path for your selected workflow version.",
    },
    {
      title: "Paste in RunPod",
      body: "Run one command in your fresh ComfyUI pod to fetch the workflow and required assets.",
    },
    {
      title: "Generate",
      body: "Open ComfyUI and run with confidence, without dependency roulette.",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(250,204,21,0.18),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(34,197,94,0.16),transparent_42%),radial-gradient(circle_at_75%_85%,rgba(59,130,246,0.16),transparent_45%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 md:px-6 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto my-auto max-w-4xl text-center"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">ComfyWizard Early Access</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
              Stop wasting hours
              <br />
              on broken workflow setups.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-zinc-300 md:text-lg">
              Discover one-click-install workflows with clear dependencies, ready to run.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                ref={joinButtonRef}
                size="lg"
                className="bg-amber-400 text-black hover:bg-amber-300"
                onClick={() => setJoinModalOpen(true)}
              >
                Join now!
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
              >
                <Link href="/workflow/sample?tour=1" className="inline-flex items-center gap-2">
                  See sample install flow <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-300">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-300" />
                {launchSignal}
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-300" />
                Free early access
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-300" />
                Dependency-first setup flow
              </span>
            </div>
          </motion.div>

          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:mt-auto md:p-8">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How one-click install works</h2>
            <p className="mt-2 text-sm text-zinc-400 md:text-base">
              The exact flow users asked for: choose workflow - click install - paste in RunPod - generate.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {flowSteps.map((step, index) => (
                <motion.article
                  key={step.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.35, delay: index * 0.07 }}
                  className="relative rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4"
                >
                  <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-semibold text-black">
                    {index + 1}
                  </div>
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{step.body}</p>
                  {index < flowSteps.length - 1 ? (
                    <ArrowRight className="absolute -right-2 top-6 hidden h-4 w-4 text-zinc-600 md:block" />
                  ) : null}
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {joinModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <button
            type="button"
            aria-label="Close invite modal"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeJoinModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Request your invite"
            ref={dialogRef}
            className="relative z-10 w-full max-w-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute right-3 top-3 z-20">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="pointer-events-auto text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                onClick={closeJoinModal}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <WaitlistForm
              funnelId={funnelId}
              discordInviteUrl="https://discord.gg/5KtWuSfNrp"
              showInstallIntent={false}
              title="Request your invite"
              theme="dark"
              autoFocusEmail
              trackLpView={false}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
