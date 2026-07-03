import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import { LabelBadge } from "@/frontend/components/shared/label-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { runsLabels } from "../labels";
import {
  annotationFor,
  formatLatency,
  type EvalResultItem,
} from "../workspace-format";

export function ResultsTable({
  snapshot,
  results,
  selectedResultId,
  onSelectResult,
}: {
  snapshot: EvalWorkspaceResponse;
  results: EvalResultItem[];
  selectedResultId: string | null;
  onSelectResult: (resultId: string) => void;
}) {
  if (results.length === 0) {
    return (
      <p className="rounded-md border border-dashed px-4 py-6 text-center text-xs text-muted-foreground">
        {runsLabels.results.empty}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{runsLabels.results.caseColumn}</TableHead>
          <TableHead>{runsLabels.results.statusColumn}</TableHead>
          <TableHead className="text-right">
            {runsLabels.results.latencyColumn}
          </TableHead>
          <TableHead className="text-right">
            {runsLabels.results.scoreColumn}
          </TableHead>
          <TableHead>{runsLabels.results.tagsColumn}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result) => {
          const testCase = snapshot.cases.find(
            (item) => item.caseId === result.caseId,
          );
          const annotation = annotationFor(snapshot, result.resultId);
          return (
            <TableRow
              key={result.resultId}
              className="cursor-pointer data-[selected=true]:bg-primary/5"
              data-selected={result.resultId === selectedResultId}
              onClick={() => onSelectResult(result.resultId)}
            >
              <TableCell>
                <span className="block max-w-[260px] truncate font-medium">
                  {testCase?.name ?? result.caseId}
                </span>
              </TableCell>
              <TableCell>
                <LabelBadge
                  variant={result.status === "failed" ? "destructive" : "secondary"}
                >
                  {result.status}
                </LabelBadge>
              </TableCell>
              <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatLatency(result.latencyMs)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs tabular-nums">
                {annotation ? annotation.score : "-"}
              </TableCell>
              <TableCell>
                <span className="flex flex-wrap gap-1">
                  {(annotation?.tags ?? []).map((tag) => (
                    <LabelBadge key={tag} variant="outline">
                      {tag}
                    </LabelBadge>
                  ))}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
