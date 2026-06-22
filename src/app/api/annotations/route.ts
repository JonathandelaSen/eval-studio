import { ZodError } from "zod";
import { evalWorkspaceModule } from "@/lib/container";
import { saveAnnotationRequestSchema } from "./validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = saveAnnotationRequestSchema.parse(await request.json());
    const annotation = await evalWorkspaceModule.saveAnnotation.execute(body);
    return Response.json(annotation.toPrimitives(), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Invalid annotation.", issues: error.issues },
        { status: 400 },
      );
    }
    return Response.json(
      { error: error instanceof Error ? error.message : "Annotation failed." },
      { status: 500 },
    );
  }
}
