"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/frontend/utils/cn";
import { runsLabels } from "../labels";
import { casesForSuite } from "../workspace-format";
import {
  caseRunsPath,
  suiteCasesPath,
  suiteFilesPath,
  suiteStatsPath,
} from "../routes";
import { useWorkspace } from "./workspace-provider";
import { SuiteBar } from "./suite-bar";

type TabKey = "runs" | "cases" | "stats" | "files";

function activeTab(pathname: string): TabKey {
  if (pathname.includes("/runs")) return "runs";
  if (pathname.includes("/stats")) return "stats";
  if (pathname.includes("/files")) return "files";
  return "cases";
}

export function SuiteShell({
  suiteId,
  children,
}: {
  suiteId: string;
  children: React.ReactNode;
}) {
  const { snapshot, mutations } = useWorkspace();
  const pathname = usePathname();
  const params = useParams<{ caseId?: string }>();

  const cases = casesForSuite(snapshot, suiteId);
  const activeCaseId =
    (params.caseId && cases.some((testCase) => testCase.caseId === params.caseId)
      ? params.caseId
      : cases[0]?.caseId) ?? null;

  const runsHref = activeCaseId
    ? caseRunsPath(suiteId, activeCaseId)
    : suiteCasesPath(suiteId);

  const tabs: { key: TabKey; label: string; href: string }[] = [
    { key: "runs", label: runsLabels.views.runs, href: runsHref },
    { key: "cases", label: runsLabels.views.cases, href: suiteCasesPath(suiteId) },
    { key: "stats", label: runsLabels.views.stats, href: suiteStatsPath(suiteId) },
    { key: "files", label: runsLabels.views.files, href: suiteFilesPath(suiteId) },
  ];
  const current = activeTab(pathname);

  return (
    <div className="flex flex-col gap-3">
      <SuiteBar snapshot={snapshot} suiteId={suiteId} mutations={mutations} />
      <nav
        aria-label={runsLabels.rail.workspaceTitle}
        className="inline-flex h-9 w-fit items-center rounded-md bg-muted p-1"
      >
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={current === tab.key ? "page" : undefined}
            className={cn(
              "inline-flex items-center justify-center rounded-sm px-3 py-1 text-sm font-medium transition-colors",
              current === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="mt-1">{children}</div>
    </div>
  );
}
