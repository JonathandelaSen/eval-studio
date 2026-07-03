import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { ok } from "@/app/api/_shared/api-responses";
import { evalExecutionModule } from "@/lib/container";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok({ providers: (await evalExecutionModule.listProviders.execute()).toPrimitives() });
  } catch (error) {
    return handleApiError(error);
  }
}
