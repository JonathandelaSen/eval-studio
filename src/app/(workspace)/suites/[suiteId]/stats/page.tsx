import { StatsView } from "@/frontend/features/runs/components/stats-view";

export const dynamic = "force-dynamic";

export default async function StatsPage({
  params,
}: {
  params: Promise<{ suiteId: string }>;
}) {
  const { suiteId } = await params;
  return <StatsView suiteId={suiteId} />;
}
