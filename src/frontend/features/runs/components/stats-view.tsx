"use client";

import { useWorkspace } from "./workspace-provider";
import { SuiteStats } from "./suite-stats";

export function StatsView({ suiteId }: { suiteId: string }) {
  const { snapshot } = useWorkspace();
  return <SuiteStats snapshot={snapshot} suiteId={suiteId} />;
}
