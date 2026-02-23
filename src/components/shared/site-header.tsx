"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type SiteHeaderProps = {
  basePath: string;
  variantLabel: string;
};

export function SiteHeader({ basePath, variantLabel }: SiteHeaderProps) {
  const router = useRouter();

  function openHelpTour() {
    router.push("/workflows?tour=1");
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link href={basePath} className="text-lg font-semibold tracking-tight">
            ComfyWizardUI
          </Link>
          <Badge variant="secondary">{variantLabel}</Badge>
        </div>
        <nav className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link href="/workflows">Workflow Hub</Link>
          <button
            type="button"
            onClick={openHelpTour}
            className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-accent"
          >
            Help
          </button>
          <Link
            href="/waitlist"
            className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-accent"
          >
            Waitlist
          </Link>
        </nav>
      </div>
    </header>
  );
}
