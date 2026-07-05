import { redirect } from "next/navigation";
import { suiteCasesPath } from "@/frontend/features/runs/routes";

export const dynamic = "force-dynamic";

export default async function SuiteHome({
  params,
}: {
  params: Promise<{ suiteId: string }>;
}) {
  const { suiteId } = await params;
  redirect(suiteCasesPath(suiteId));
}
