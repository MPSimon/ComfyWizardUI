import rawWorkflows from "@/lib/data/workflows.json";
import type {
  WorkflowDetail,
  WorkflowListItem,
  WorkflowListParams,
  WorkflowRecord,
} from "@/lib/types/workflow";
import { filterAndSortWorkflows } from "@/features/filters/workflow-filters";

const records = rawWorkflows as WorkflowRecord[];

function buildInstallCommand(slug: string, version: string) {
  return `curl -fsSL https://www.comfywizard.tech/api/install/script | bash -s -- --workflow ${slug} --version ${version}`;
}

function toListItem(record: WorkflowRecord): WorkflowListItem {
  const required = record.dependencies.filter((dependency) => dependency.required).length;
  const optional = record.dependencies.length - required;

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    stack: record.stack,
    coverImageUrl: record.coverImageUrl,
    isVerified: record.isVerified,
    dependencyCounts: {
      required,
      optional,
    },
    latestVersion: record.versions[0]?.version ?? "1.0.0",
    updatedAt: record.updatedAt,
  };
}

export async function getWorkflowList(params: WorkflowListParams = {}): Promise<WorkflowListItem[]> {
  const list = records.map(toListItem);
  return filterAndSortWorkflows(list, params);
}

export async function getWorkflowBySlug(slug: string): Promise<WorkflowDetail | null> {
  const record = records.find((workflow) => workflow.slug === slug);
  if (!record) {
    return null;
  }

  const workflow = {
    ...toListItem(record),
    description: record.description,
    tags: record.tags,
    origin: record.origin,
  };

  const dependenciesRequired = record.dependencies.filter((dependency) => dependency.required);
  const dependenciesOptional = record.dependencies.filter((dependency) => !dependency.required);

  return {
    workflow,
    versions: record.versions,
    dependenciesRequired,
    dependenciesOptional,
    quickstart: {
      ...record.quickstart,
      installCommandPreview: buildInstallCommand(record.slug, workflow.latestVersion),
    },
  };
}

export async function getWorkflowDependencies(workflowVersionId: string) {
  const workflow = records.find((record) =>
    record.versions.some((version) => version.id === workflowVersionId),
  );

  if (!workflow) {
    return [];
  }

  return workflow.dependencies;
}

export async function getAvailableStacks(): Promise<string[]> {
  return [...new Set(records.map((record) => record.stack))].sort();
}
