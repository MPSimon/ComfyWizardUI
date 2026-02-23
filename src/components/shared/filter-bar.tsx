"use client";

import { useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkflowListItem } from "@/lib/types/workflow";

export type FilterState = {
  query: string;
  stack: string;
  verifiedOnly: boolean;
  sort: "updated_desc" | "title_asc";
};

type FilterBarProps = {
  workflows: WorkflowListItem[];
  onChange: (state: FilterState, filtered: WorkflowListItem[]) => void;
};

const DEFAULT_STATE: FilterState = {
  query: "",
  stack: "all",
  verifiedOnly: false,
  sort: "updated_desc",
};

function applyFilters(workflows: WorkflowListItem[], state: FilterState): WorkflowListItem[] {
  const query = state.query.trim().toLowerCase();

  const filtered = workflows.filter((workflow) => {
    const queryMatch =
      query.length === 0 ||
      workflow.title.toLowerCase().includes(query) ||
      workflow.summary.toLowerCase().includes(query);

    const stackMatch = state.stack === "all" || workflow.stack === state.stack;
    const verifiedMatch = !state.verifiedOnly || workflow.isVerified;

    return queryMatch && stackMatch && verifiedMatch;
  });

  if (state.sort === "title_asc") {
    return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }

  return [...filtered].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function FilterBar({ workflows, onChange }: FilterBarProps) {
  const [state, setState] = useState<FilterState>(DEFAULT_STATE);

  const stacks = useMemo(
    () => ["all", ...new Set(workflows.map((workflow) => workflow.stack))],
    [workflows],
  );

  function updateState(nextState: FilterState) {
    setState(nextState);
    onChange(nextState, applyFilters(workflows, nextState));
  }

  return (
    <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-[1fr_180px_180px_auto] md:items-center">
      <Input
        value={state.query}
        placeholder="Search workflows"
        onChange={(event) => updateState({ ...state, query: event.target.value })}
      />

      <Select value={state.stack} onValueChange={(value) => updateState({ ...state, stack: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Stack" />
        </SelectTrigger>
        <SelectContent>
          {stacks.map((stack) => (
            <SelectItem key={stack} value={stack}>
              {stack === "all" ? "All stacks" : stack.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={state.sort}
        onValueChange={(value: "updated_desc" | "title_asc") =>
          updateState({ ...state, sort: value })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated_desc">Newest</SelectItem>
          <SelectItem value="title_asc">Title A-Z</SelectItem>
        </SelectContent>
      </Select>

      <label className="flex items-center gap-2 text-sm font-medium">
        <Checkbox
          checked={state.verifiedOnly}
          onCheckedChange={(checked) =>
            updateState({ ...state, verifiedOnly: checked === true })
          }
        />
        Verified only
      </label>
    </div>
  );
}
