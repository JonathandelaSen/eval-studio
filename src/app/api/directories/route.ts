import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { errorResponse, ok } from "@/app/api/_shared/api-responses";
import { ProjectDirectoryUnreadableError } from "@/backend/modules/project";
import { projectModule } from "@/lib/container";
import { toDirectoryListingResponse } from "./responses";
import { parseDirectoryRequest } from "./validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const parsed = parseDirectoryRequest(
      new URL(request.url).searchParams.get("path"),
    );
    if (!parsed.ok) return errorResponse(parsed.error);
    const listing = await projectModule.listDirectories.execute(
      parsed.value,
    );
    return ok(toDirectoryListingResponse(listing.toPrimitives()));
  } catch (error: unknown) {
    if (error instanceof ProjectDirectoryUnreadableError) {
      return errorResponse({
        status: 400,
        code: error.code,
        message: error.message,
      });
    }
    return handleApiError(error);
  }
}
