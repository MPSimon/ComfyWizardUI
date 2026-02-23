import type { DependencyItem } from "@/lib/types/workflow";
import { SourceLinkButton, sourcePriority } from "@/components/shared/source-link-button";

function sortDependencies(dependencies: DependencyItem[]) {
  return [...dependencies].sort((a, b) => {
    const sourceDiff = sourcePriority(a) - sourcePriority(b);
    if (sourceDiff !== 0) return sourceDiff;
    return a.filename.localeCompare(b.filename);
  });
}

export function DependencyCompactTable({
  dependencies,
}: {
  dependencies: DependencyItem[];
}) {
  const ordered = sortDependencies(dependencies);

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">Dependency</th>
            <th className="px-3 py-2 text-left">Target</th>
            <th className="px-3 py-2 text-left">Link</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((dep) => (
            <tr key={`compact-${dep.id}`} className="border-t align-top">
              <td className="px-3 py-2 break-all">{dep.filename}</td>
              <td className="px-3 py-2">{dep.targetRelDir}</td>
              <td className="px-3 py-2">
                <SourceLinkButton dependency={dep} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
