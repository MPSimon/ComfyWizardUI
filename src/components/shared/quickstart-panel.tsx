import { Copy, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkflowVersion } from "@/lib/types/workflow";

type QuickstartPanelProps = {
  runpodTemplateUrl: string;
  installCommandPreview: string;
  versions?: WorkflowVersion[];
};

export function QuickstartPanel({
  runpodTemplateUrl,
  installCommandPreview,
  versions = [],
}: QuickstartPanelProps) {
  return (
    <Card className="rounded-2xl gap-3 py-4">
      <CardHeader className="space-y-1 px-4 pb-0">
        <CardTitle className="text-base">Quickstart Install</CardTitle>
        <Badge variant="secondary" className="w-fit">
          One-command install
        </Badge>
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

        {versions.length > 0 ? (
          <div className="rounded-xl border p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Versions
            </p>
            <div className="space-y-2">
              {versions.map((version) => (
                <div key={version.id} className="text-xs">
                  <p className="font-medium">v{version.version}</p>
                  <p className="text-muted-foreground">{version.notes}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <Button variant="outline" className="w-full justify-between" disabled>
          Copy command <Copy className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
