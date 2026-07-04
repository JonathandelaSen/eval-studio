"use client";

import { Braces } from "lucide-react";
import type { EvalWorkspaceResponse } from "@/app/api/workspace/responses";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/frontend/components/ui/tabs";
import { formatJson, type EvalResultItem } from "../workspace-format";
import { runsLabels } from "../labels";
import { CopyButton } from "./copy-button";

export function ResultTechnicalDetails({
  result,
  testCase,
  annotation,
}: {
  result: EvalResultItem;
  testCase: EvalWorkspaceResponse["cases"][number] | undefined;
  annotation: EvalWorkspaceResponse["annotations"][number] | null;
}) {
  const requestText = formatJson(result.providerRequest);

  return (
    <details className="group overflow-hidden rounded-lg border bg-muted/10">
      <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
        <span className="flex items-center gap-1.5">
          <Braces className="size-3.5" />
          {runsLabels.technical.summary}
        </span>
        <span className="text-xs text-muted-foreground/60 transition-transform duration-200 group-open:rotate-180">
          ▼
        </span>
      </summary>
      <div className="border-t bg-card p-5">
        <Tabs defaultValue="request" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="request">{runsLabels.technical.requestPanel}</TabsTrigger>
            <TabsTrigger value="variables">{runsLabels.technical.variablesPanel}</TabsTrigger>
            <TabsTrigger value="template">{runsLabels.technical.templatePanel}</TabsTrigger>
            <TabsTrigger value="raw">{runsLabels.technical.rawPanel}</TabsTrigger>
          </TabsList>
          <TabsContent value="request">
            <div className="overflow-hidden rounded-lg border bg-zinc-950 text-zinc-100 shadow-inner">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                <span>{result.providerRequest?.contentType ?? runsLabels.technical.requestPanel}</span>
                {requestText ? <CopyButton text={requestText} /> : null}
              </div>
              <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-relaxed">
                <code>{requestText || runsLabels.technical.requestEmpty}</code>
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="variables">
            <pre className="max-h-[300px] overflow-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs text-foreground">
              <code>{formatJson(result.promptVariables ?? testCase?.promptVariables ?? null) || runsLabels.review.emptyValue}</code>
            </pre>
          </TabsContent>
          <TabsContent value="template">
            <pre className="max-h-[300px] overflow-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs text-foreground">
              <code>{result.renderedPrompt?.format || runsLabels.review.emptyValue}</code>
            </pre>
          </TabsContent>
          <TabsContent value="raw">
            <pre className="max-h-[400px] overflow-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs text-foreground">
              <code>{formatJson({ result, case: testCase ?? null, annotation })}</code>
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </details>
  );
}
