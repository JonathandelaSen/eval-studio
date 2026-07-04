import type { EvalCaseItem } from "../workspace-format";
import { runsLabels } from "../labels";

export function RunCaseFilter({
  cases,
  selectedCaseId,
  onSelectCase,
}: {
  cases: EvalCaseItem[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
}) {
  if (cases.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card p-3">
      <label
        className="text-xs font-medium text-muted-foreground"
        htmlFor="run-case-select"
      >
        {runsLabels.runs.caseLabel}
      </label>
      <select
        id="run-case-select"
        name="caseId"
        value={selectedCaseId ?? ""}
        onChange={(event) => onSelectCase(event.target.value)}
        className="mt-1.5 min-h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {cases.map((testCase) => (
          <option key={testCase.caseId} value={testCase.caseId}>
            {testCase.name}
          </option>
        ))}
      </select>
    </div>
  );
}
