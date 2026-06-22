import { evalWorkspaceModule } from "@/lib/container";

export const runtime = "nodejs";

export async function GET() {
  const snapshot = await evalWorkspaceModule.getEvalWorkspaceSnapshot.execute();
  return Response.json(snapshot.toPrimitives());
}
