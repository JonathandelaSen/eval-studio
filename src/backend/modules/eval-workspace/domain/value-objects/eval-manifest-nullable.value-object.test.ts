import { describe, expect, it } from "vitest";
import { EvalManifestNullable } from "./eval-manifest-nullable.value-object";

describe("EvalManifestNullable", () => {
  it("round-trips null values", () => {
    expect(EvalManifestNullable.fromPrimitives(null).toPrimitives()).toBeNull();
  });

  it("round-trips non-null manifest", () => {
    const manifest = {
      workspaceName: "My Workspace",
      createdAt: "2026-07-03T00:00:00Z",
    };
    expect(EvalManifestNullable.fromPrimitives(manifest).toPrimitives()).toEqual(
      manifest,
    );
  });
});
