import sampleV100 from "@/lib/data/install-manifests/sample-1.0.0.json";
import type { InstallManifest } from "@/lib/types/install";

type WorkflowManifestVersions = {
  latest: string;
  versions: Record<string, InstallManifest>;
};

const registry: Record<string, WorkflowManifestVersions> = {
  sample: {
    latest: "1.0.0",
    versions: {
      "1.0.0": sampleV100 as InstallManifest,
    },
  },
};

export function getInstallManifest(slug: string, version?: string): InstallManifest | null {
  const workflow = registry[slug];
  if (!workflow) {
    return null;
  }

  const resolvedVersion = version && version.trim().length > 0 ? version.trim() : workflow.latest;
  return workflow.versions[resolvedVersion] ?? null;
}

export function getLatestInstallVersion(slug: string): string | null {
  const workflow = registry[slug];
  return workflow ? workflow.latest : null;
}
