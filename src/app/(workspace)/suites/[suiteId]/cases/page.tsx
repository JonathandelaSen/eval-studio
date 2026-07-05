import { CasesView } from "@/frontend/features/runs/components/cases-view";

export const dynamic = "force-dynamic";

export default async function CasesPage({
  params,
}: {
  params: Promise<{ suiteId: string }>;
}) {
  const { suiteId } = await params;
  return <CasesView suiteId={suiteId} caseId={null} />;
}
