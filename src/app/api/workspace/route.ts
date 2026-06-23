import { evalWorkspaceModule } from "@/lib/container";

export const runtime = "nodejs";

export async function GET() {
  const snapshot = await evalWorkspaceModule.getEvalWorkspace.execute();
  return Response.json(snapshot.toPrimitives());
}
