import { ZodError } from "zod";
import { evalExecutionModule, evalWorkspaceModule } from "@/lib/container";
import { createRunRequestSchema } from "./validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = createRunRequestSchema.parse(await request.json());
    const snapshot = await evalWorkspaceModule.getEvalWorkspace.execute();
    const run = await evalExecutionModule.createRun.execute({
      ...body,
      cases: snapshot.toPrimitives().cases,
    });
    return Response.json(run.toPrimitives(), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Invalid run request.", issues: error.issues },
        { status: 400 },
      );
    }
    return Response.json(
      { error: error instanceof Error ? error.message : "Run failed." },
      { status: 500 },
    );
  }
}
