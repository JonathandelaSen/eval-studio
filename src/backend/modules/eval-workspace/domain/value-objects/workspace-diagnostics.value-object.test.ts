import { describe, expect, it } from "vitest";
import { WorkspaceDiagnostics } from "./workspace-diagnostics.value-object";

describe("WorkspaceDiagnostics", () => {
  it("round-trips empty diagnostics array", () => {
    expect(WorkspaceDiagnostics.fromPrimitives([]).toPrimitives()).toEqual([]);
  });

  it("round-trips diagnostic values", () => {
    const diagnostics = [
      {
        path: "manifest.json",
        message: "File not found",
      },
    ];
    expect(
      WorkspaceDiagnostics.fromPrimitives(diagnostics).toPrimitives(),
    ).toEqual(diagnostics);
  });
});
