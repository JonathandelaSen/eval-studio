import { describe, expect, it } from "vitest";
import { ApiClientError, readJsonResponse } from "./read-json-response";

describe("readJsonResponse", () => {
  it("returns a successful typed payload", async () => {
    const response = Response.json({ id: "project-1" });

    await expect(
      readJsonResponse<{ id: string }>(response),
    ).resolves.toEqual({ id: "project-1" });
  });

  it("throws a typed API error for canonical error responses", async () => {
    const response = Response.json(
      { error: { code: "project_not_found", message: "Project does not exist." } },
      { status: 404 },
    );

    const error = await readJsonResponse(response).catch((reason) => reason);

    expect(error).toBeInstanceOf(ApiClientError);
    expect(error).toMatchObject({
      status: 404,
      code: "project_not_found",
      message: "Project does not exist.",
    });
  });

  it("uses a safe fallback for malformed error responses", async () => {
    const response = new Response("broken", { status: 500 });

    await expect(readJsonResponse(response)).rejects.toThrow(
      "The request could not be completed.",
    );
  });
});
