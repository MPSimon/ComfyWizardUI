import type { ReactNode } from "react";

export function VariantAShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-zinc-50 text-zinc-950">{children}</div>;
}
