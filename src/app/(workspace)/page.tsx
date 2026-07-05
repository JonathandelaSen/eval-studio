import { redirect } from "next/navigation";
import { EmptyWorkspace } from "@/frontend/features/runs/components/empty-workspace";
import { suiteCasesPath } from "@/frontend/features/runs/routes";
import { getWorkspaceContext } from "./workspace-context";

export const dynamic = "force-dynamic";

export default async function WorkspaceHome() {
  const { snapshot } = await getWorkspaceContext();
  const firstSuite = snapshot.suites[0];

  if (firstSuite) {
    redirect(suiteCasesPath(firstSuite.suiteId));
  }

  return <EmptyWorkspace />;
}
