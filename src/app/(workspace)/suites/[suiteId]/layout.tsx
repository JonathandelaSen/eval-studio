import { redirect } from "next/navigation";
import { SuiteShell } from "@/frontend/features/runs/components/suite-shell";
import { getWorkspaceContext } from "../../workspace-context";

export const dynamic = "force-dynamic";

export default async function SuiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ suiteId: string }>;
}) {
  const { suiteId } = await params;
  const { snapshot } = await getWorkspaceContext();
  if (!snapshot.suites.some((suite) => suite.suiteId === suiteId)) {
    redirect("/");
  }

  return <SuiteShell suiteId={suiteId}>{children}</SuiteShell>;
}
