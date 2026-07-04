import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteSuite, duplicateCase } from "./runs-api";

describe("runs API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deletes a suite through its resource route", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ suiteId: "support refunds" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await deleteSuite("support refunds");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/suites/support%20refunds",
      { method: "DELETE" },
    );
  });

  it("posts to the duplicate endpoint for the selected case", async () => {
    const response = {
      caseId: "550e8400-e29b-41d4-a716-446655440002",
      suiteId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Refund policy copy",
      createdAt: "2026-07-04T12:00:00.000Z",
      renderedPrompt: { format: "text", text: "Can this be returned?" },
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(duplicateCase("case/with spaces")).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/cases/case%2Fwith%20spaces/duplicate",
      { method: "POST" },
    );
  });
});
