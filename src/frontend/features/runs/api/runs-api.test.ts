import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteSuite } from "./runs-api";

describe("runs API", () => {
  afterEach(() => vi.unstubAllGlobals());

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
});
