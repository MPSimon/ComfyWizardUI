import type { WorkflowListItem, WorkflowListParams } from "@/lib/types/workflow";

export function filterAndSortWorkflows(
  workflows: WorkflowListItem[],
  params: WorkflowListParams,
): WorkflowListItem[] {
  const query = (params.query ?? "").trim().toLowerCase();

  const filtered = workflows.filter((workflow) => {
    const queryMatch =
      query.length === 0 ||
      workflow.title.toLowerCase().includes(query) ||
      workflow.summary.toLowerCase().includes(query);

    const stackMatch = !params.stack || params.stack === "all" || workflow.stack === params.stack;
    const verifiedMatch = !params.verifiedOnly || workflow.isVerified;

    return queryMatch && stackMatch && verifiedMatch;
  });

  if (params.sort === "title_asc") {
    return filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  return filtered.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
