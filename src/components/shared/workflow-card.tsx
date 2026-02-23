import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { WorkflowListItem } from "@/lib/types/workflow";

type WorkflowCardProps = {
  workflow: WorkflowListItem;
  hrefBase: string;
  emphasizeImage?: boolean;
};

export function WorkflowCard({ workflow, hrefBase, emphasizeImage = false }: WorkflowCardProps) {
  const href = `${hrefBase}/workflow/${workflow.slug}`;

  return (
    <Link
      href={href}
      aria-label={`Open workflow ${workflow.title}`}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="overflow-hidden rounded-2xl border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        <div className={`relative w-full ${emphasizeImage ? "h-52" : "h-44"}`}>
          <Image
            src={workflow.coverImageUrl}
            alt={`${workflow.title} preview`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="uppercase tracking-wide">
              {workflow.stack}
            </Badge>
            {workflow.isVerified ? <Badge>Verified</Badge> : <Badge variant="secondary">Community</Badge>}
          </div>
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold tracking-tight">{workflow.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{workflow.summary}</p>
          </div>
        </CardHeader>
        <CardContent className="pb-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Required: {workflow.dependencyCounts.required}</span>
            <span>Optional: {workflow.dependencyCounts.optional}</span>
          </div>
          <div className="mt-1">Updated: {new Date(workflow.updatedAt).toLocaleDateString()}</div>
        </CardContent>
        <CardFooter>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            View details <ArrowRight className="h-4 w-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
