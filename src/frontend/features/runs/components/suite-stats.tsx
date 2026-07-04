import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { cn } from "@/frontend/utils/cn";
import { runsLabels } from "../labels";
import {
  buildRuntimeLeaderboard,
  buildSuiteMatrix,
  casesForSuite,
  formatLatency,
  type RuntimeLeaderboardRow,
} from "../workspace-format";
import { RuntimeChip, ScoreDots } from "./runtime-chip";

function formatPercent(share: number | null): string {
  if (share === null) return runsLabels.stats.unscored;
  return `${Math.round(share * 100)}%`;
}

export function SuiteStats({
  snapshot,
  suiteId,
}: {
  snapshot: EvalWorkspaceResponse;
  suiteId: string | null;
}) {
  const leaderboard = buildRuntimeLeaderboard(snapshot, suiteId);
  const matrix = buildSuiteMatrix(snapshot, suiteId);
  const totalCases = casesForSuite(snapshot, suiteId).length;

  if (leaderboard.length === 0) {
    return (
      <section className="rounded-lg border bg-card">
        <p className="px-4 py-16 text-center text-sm text-muted-foreground">
          {runsLabels.stats.empty}
        </p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Leaderboard rows={leaderboard} totalCases={totalCases} />
      <Matrix matrix={matrix} />
    </div>
  );
}

function Leaderboard({
  rows,
  totalCases,
}: {
  rows: RuntimeLeaderboardRow[];
  totalCases: number;
}) {
  return (
    <section className="rounded-lg border bg-card">
      <header className="border-b px-4 py-2.5">
        <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          {runsLabels.stats.leaderboardTitle}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {runsLabels.stats.leaderboardHint}
        </p>
      </header>
      <div className="px-2 py-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{runsLabels.stats.runtimeColumn}</TableHead>
              <TableHead className="text-right">
                {runsLabels.stats.scoreColumn}
              </TableHead>
              <TableHead className="text-right">
                {runsLabels.stats.passRateColumn}
              </TableHead>
              <TableHead className="text-right">
                {runsLabels.stats.latencyColumn}
              </TableHead>
              <TableHead className="text-right">
                {runsLabels.stats.resultsColumn}
              </TableHead>
              <TableHead className="text-right">
                {runsLabels.stats.coverageColumn}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.identity.key}>
                <TableCell>
                  <RuntimeChip runtime={row.runtime} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <ScoreDots
                    score={row.meanScore}
                    labelWhenEmpty={runsLabels.stats.unscored}
                  />
                </TableCell>
                <TableCell
                  className="text-right font-mono text-xs tabular-nums"
                  title={runsLabels.stats.passRateHint}
                >
                  {formatPercent(row.passRate)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {formatLatency(row.meanLatency)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {row.resultCount}
                  {row.failedCount > 0 ? (
                    <span className="ml-1 text-destructive">
                      ({row.failedCount}✗)
                    </span>
                  ) : null}
                </TableCell>
                <TableCell
                  className="text-right font-mono text-xs tabular-nums text-muted-foreground"
                  title={runsLabels.stats.coverageHint}
                >
                  {row.coveredCases}/{totalCases}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function Matrix({ matrix }: { matrix: ReturnType<typeof buildSuiteMatrix> }) {
  return (
    <section className="rounded-lg border bg-card">
      <header className="border-b px-4 py-2.5">
        <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          {runsLabels.stats.matrixTitle}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {runsLabels.stats.matrixHint}
        </p>
      </header>
      <div className="overflow-x-auto px-2 py-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-card">
                {runsLabels.stats.caseColumn}
              </TableHead>
              {matrix.columns.map((column) => (
                <TableHead key={column.identity.key} className="text-center">
                  <div className="flex justify-center">
                    <RuntimeChip runtime={column.runtime} size="sm" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrix.cases.map((testCase) => {
              const bestScore = matrix.bestScoreFor(testCase.caseId);
              return (
                <TableRow key={testCase.caseId}>
                  <TableCell className="sticky left-0 z-10 max-w-[220px] truncate bg-card font-medium">
                    {testCase.name}
                  </TableCell>
                  {matrix.columns.map((column) => {
                    const cell = matrix.cellFor(
                      testCase.caseId,
                      column.identity.key,
                    );
                    if (!cell) {
                      return (
                        <TableCell
                          key={column.identity.key}
                          className="text-center text-xs text-muted-foreground/50"
                        >
                          {runsLabels.stats.noResults}
                        </TableCell>
                      );
                    }
                    const isBest =
                      bestScore !== null && cell.score === bestScore;
                    return (
                      <TableCell
                        key={column.identity.key}
                        className={cn(
                          "text-center",
                          isBest && "bg-amber-500/10",
                        )}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          {cell.result.status === "failed" ? (
                            <span className="font-mono text-[0.65rem] font-medium text-destructive">
                              failed
                            </span>
                          ) : (
                            <ScoreDots score={cell.score} labelWhenEmpty="-" />
                          )}
                          <span className="flex items-center gap-1 font-mono text-[0.6rem] text-muted-foreground">
                            {formatLatency(cell.result.latencyMs)}
                            {cell.count > 1 ? (
                              <span className="text-muted-foreground/60">
                                ×{cell.count}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
