export type InstallDependencySource = "huggingface" | "civitai" | "url";

export type InstallManifestDependency = {
  source: InstallDependencySource;
  repoId?: string;
  modelVersionId?: string;
  url?: string;
  filename: string;
  targetRelDir: string;
  revision?: string;
  expectedSha256?: string;
  required: boolean;
};

export type InstallManifestCustomNode = {
  name: string;
  repoUrl: string;
  ref?: string;
  requirementsFile?: string;
  required: boolean;
};

export type InstallManifest = {
  schemaVersion: "1.0";
  workflow: {
    slug: string;
    version: string;
    stack: string;
    workflowFileUrl: string;
    workflowFileName: string;
  };
  dependencies: InstallManifestDependency[];
  customNodes: InstallManifestCustomNode[];
};
