import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">This route does not exist in the focused A-only MVP.</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">Back to gallery</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
