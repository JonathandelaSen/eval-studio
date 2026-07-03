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
  formatDate,
  resultsForCase,
  type EvalCaseItem,
} from "../workspace-format";
import { RuntimeChip } from "./runtime-chip";

export function CaseHistory({
  snapshot,
  testCase,
}: {
  snapshot: EvalWorkspaceResponse;
  testCase: EvalCaseItem;
}) {
  const results = resultsForCase(snapshot, testCase.caseId);
  return (
    <section className="rounded-lg border bg-card">
      <header className="border-b px-4 py-2.5">
        <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          {runsLabels.cases.historyTitle}
        </h3>
      </header>
      {results.length === 0 ? (
        <p className="px-4 py-5 text-center text-xs text-muted-foreground">
          {runsLabels.cases.historyEmpty}
        </p>
      ) : (
        <div className="px-2 py-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{runsLabels.cases.runColumn}</TableHead>
                <TableHead>{runsLabels.cases.modelColumn}</TableHead>
                <TableHead>{runsLabels.cases.statusColumn}</TableHead>
                <TableHead className="text-right">
                  {runsLabels.cases.scoreColumn}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => {
                const run = snapshot.runs.find(
                  (item) => item.runId === result.runId,
                );
                const annotation = annotationFor(snapshot, result.resultId);
                return (
                  <TableRow key={result.resultId}>
                    <TableCell>
                      <span className="block max-w-[220px] truncate font-medium">
                        {run?.name ?? result.runId}
                      </span>
                      <span className="font-mono text-[0.65rem] text-muted-foreground">
                        {formatDate(result.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <RuntimeChip
                        runtime={result.runtime ?? run?.runtime}
                        fallback={result.producer}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <LabelBadge
                        variant={
                          result.status === "failed" ? "destructive" : "secondary"
                        }
                      >
                        {result.status}
                      </LabelBadge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {annotation ? annotation.score : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
