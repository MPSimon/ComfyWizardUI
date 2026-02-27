export type DependencySource = "huggingface" | "civitai" | "private";

export type DependencyItem = {
  id: string;
  source: DependencySource;
  filename: string;
  targetRelDir: string;
  sourceUrl?: string;
  repoId?: string;
  modelVersionId?: string;
  revision?: string;
  expectedSha256?: string;
  sizeBytes?: number;
  required: boolean;
};

export type WorkflowVersion = {
  id: string;
  version: string;
  createdAt: string;
  notes: string;
};

export type WorkflowQuickstart = {
  runpodTemplateUrl: string;
  installCommandPreview: string;
};

export type WorkflowOrigin = {
  label: string;
  url: string;
  source: "civitai" | "huggingface" | "external";
};

export type WorkflowListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  stack: string;
  coverImageUrl: string;
  isVerified: boolean;
  dependencyCounts: {
    required: number;
    optional: number;
  };
  latestVersion: string;
  updatedAt: string;
};

export type WorkflowDetail = {
  workflow: WorkflowListItem & {
    description: string;
    tags: string[];
    origin?: WorkflowOrigin;
  };
  versions: WorkflowVersion[];
  dependenciesRequired: DependencyItem[];
  dependenciesOptional: DependencyItem[];
  quickstart: WorkflowQuickstart;
};

export type WorkflowRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  stack: string;
  coverImageUrl: string;
  isVerified: boolean;
  updatedAt: string;
  tags: string[];
  origin?: WorkflowOrigin;
  versions: WorkflowVersion[];
  quickstart: WorkflowQuickstart;
  dependencies: DependencyItem[];
};

export type WorkflowListParams = {
  query?: string;
  stack?: string;
  verifiedOnly?: boolean;
  sort?: "updated_desc" | "title_asc";
};
