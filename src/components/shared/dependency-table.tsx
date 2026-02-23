import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceLinkButton } from "@/components/shared/source-link-button";
import type { DependencyItem } from "@/lib/types/workflow";

type DependencyTableProps = {
  title: string;
  dependencies: DependencyItem[];
};

export function DependencyTable({ title, dependencies }: DependencyTableProps) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {dependencies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dependencies in this section.</p>
        ) : (
          <div className="space-y-3">
            {dependencies.map((dependency) => (
              <div key={dependency.id} className="rounded-xl border p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{dependency.source}</Badge>
                  <span className="text-xs text-muted-foreground">Requirement</span>
                </div>
                <p className="text-sm font-medium break-all">{dependency.filename}</p>
                <p className="text-xs text-muted-foreground">Target: {dependency.targetRelDir}</p>
                <div className="mt-2">
                  <SourceLinkButton dependency={dependency} />
                </div>
                {dependency.repoId ? (
                  <p className="text-xs text-muted-foreground break-all">Repo: {dependency.repoId}</p>
                ) : null}
                {dependency.modelVersionId ? (
                  <p className="text-xs text-muted-foreground">Model version: {dependency.modelVersionId}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
