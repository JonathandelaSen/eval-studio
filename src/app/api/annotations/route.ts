import { evalWorkspaceModule } from "@/lib/container";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const annotation = await evalWorkspaceModule.saveAnnotation.execute(
      await request.json(),
    );
    return Response.json(annotation.toPrimitives(), { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid annotation." },
      { status: 400 },
    );
  }
}
