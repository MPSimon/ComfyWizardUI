import Image from "next/image";
import { notFound } from "next/navigation";

import { DependencyCompactTable } from "@/components/shared/dependency-display-options";
import { DependencyTable } from "@/components/shared/dependency-table";
import { QuickstartPanel } from "@/components/shared/quickstart-panel";
import { SiteHeader } from "@/components/shared/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VariantAShell } from "@/components/variant-a/variant-a-shell";
import { getWorkflowBySlug } from "@/lib/data/workflows";

type DetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const workflow = await getWorkflowBySlug(slug);
  const isSample = slug === "sample";

  if (!workflow) {
    notFound();
  }

  const requirements = [...workflow.dependenciesRequired, ...workflow.dependenciesOptional];
  const sortedRequirements = [...requirements].sort((a, b) => {
    const sourceRank = (source: string) => {
      if (source === "huggingface") return 0;
      if (source === "civitai") return 1;
      return 2;
    };
    const rankDiff = sourceRank(a.source) - sourceRank(b.source);
    if (rankDiff !== 0) return rankDiff;
    return a.filename.localeCompare(b.filename);
  });

  return (
    <VariantAShell>
      <SiteHeader basePath="/" variantLabel="Core Experience" />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-6">
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <section className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="uppercase tracking-wide">
                  {workflow.workflow.stack}
                </Badge>
                {workflow.workflow.isVerified ? <Badge>Verified</Badge> : null}
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">{workflow.workflow.title}</h1>
              <p className="mt-2 text-muted-foreground">{workflow.workflow.description}</p>
              {workflow.workflow.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {workflow.workflow.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <Card className="overflow-hidden rounded-2xl gap-3 py-4">
              <CardHeader className="px-4 pb-0">
                <CardTitle className="text-base">Workflow Preview</CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <div className="relative w-full overflow-hidden rounded-xl border bg-muted/30">
                  <Image
                    src={workflow.workflow.coverImageUrl}
                    alt={`${workflow.workflow.title} workflow preview`}
                    width={1536}
                    height={1024}
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                </div>
              </CardContent>
            </Card>

            {isSample ? (
              <Card className="rounded-2xl gap-3 py-4">
                <CardHeader className="flex flex-row items-center gap-2 px-4 pb-0">
                  <CardTitle className="text-base">Dependencies</CardTitle>
                  <span className="text-sm text-muted-foreground">{sortedRequirements.length} total dependencies</span>
                </CardHeader>
                <CardContent className="px-4">
                  <DependencyCompactTable dependencies={sortedRequirements} />
                </CardContent>
              </Card>
            ) : (
              <DependencyTable title="Dependencies" dependencies={requirements} />
            )}
          </section>

          <aside>
            <QuickstartPanel
              runpodTemplateUrl={workflow.quickstart.runpodTemplateUrl}
              installCommandPreview={workflow.quickstart.installCommandPreview}
              versions={workflow.versions}
            />
            <Card className="mt-4 rounded-2xl gap-3 py-4">
              <CardHeader className="px-4 pb-0">
                <CardTitle className="text-base">Install Flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 px-4 text-sm text-muted-foreground">
                <p>1. Choose this workflow listing.</p>
                <p>2. Copy install command to your RunPod terminal.</p>
                <p>3. Run sync to fetch dependencies.</p>
                <p>4. Open ComfyUI and generate.</p>
              </CardContent>
            </Card>
            <Card className="mt-4 rounded-2xl gap-3 py-4">
              <CardHeader className="px-4 pb-0">
                <CardTitle className="text-base">Workflow Metadata</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 px-4 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest Version</p>
                  <p className="font-medium">v{workflow.workflow.latestVersion}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Updated</p>
                  <p className="font-medium">{new Date(workflow.workflow.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Requirements</p>
                  <p className="font-medium">{requirements.length}</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

      </main>
    </VariantAShell>
  );
}
