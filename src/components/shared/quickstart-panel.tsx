"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QuickstartPanelProps = {
  runpodTemplateUrl: string;
  installCommandPreview: string;
};

export function QuickstartPanel({ runpodTemplateUrl, installCommandPreview }: QuickstartPanelProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  async function handleCopyCommand() {
    try {
      await navigator.clipboard.writeText(installCommandPreview);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <Card className="rounded-2xl gap-3 py-4">
      <CardHeader className="space-y-1 px-4 pb-0">
        <CardTitle className="text-base">Quickstart Install</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        <Button asChild className="w-full justify-between">
          <a href={runpodTemplateUrl} target="_blank" rel="noreferrer">
            Open RunPod template <ExternalLink className="h-4 w-4" />
          </a>
        </Button>

        <div className="rounded-xl border bg-muted/40 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Install command preview
          </p>
          <code className="block whitespace-pre-wrap break-all text-xs">{installCommandPreview}</code>
        </div>

        <div className="rounded-xl border p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">RunPod secrets (optional for gated assets)</p>
          <p className="mt-1">
            Set <code>HF_TOKEN</code> and <code>CIVITAI_TOKEN</code> in RunPod Secrets.
          </p>
          <a
            href="https://console.runpod.io/user/secrets"
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-primary hover:underline"
          >
            Open RunPod Secrets <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <Button
          variant="outline"
          className="w-full justify-between overflow-hidden transition-colors hover:bg-muted/60"
          onClick={handleCopyCommand}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copyState === "copied" ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="inline-flex items-center gap-2 text-emerald-500"
              >
                Copied <Check className="h-4 w-4" />
              </motion.span>
            ) : copyState === "failed" ? (
              <motion.span
                key="failed"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="inline-flex items-center gap-2 text-red-500"
              >
                Copy failed <Copy className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="inline-flex items-center gap-2"
              >
                Copy command <Copy className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </CardContent>
    </Card>
  );
}
