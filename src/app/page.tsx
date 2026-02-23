import { GalleryShell } from "@/components/shared/gallery-shell";
import { SiteHeader } from "@/components/shared/site-header";
import { VariantAShell } from "@/components/variant-a/variant-a-shell";
import { getWorkflowList } from "@/lib/data/workflows";

export default async function HomePage() {
  const workflows = await getWorkflowList();

  return (
    <VariantAShell>
      <SiteHeader basePath="/" variantLabel="Core Experience" />
      <GalleryShell
        workflows={workflows}
        hrefBase=""
        heading="Install-Ready Workflow Hub"
        subheading="Browse creator workflows with clear dependencies so you can launch faster on fresh ComfyUI setups."
      />
    </VariantAShell>
  );
}
