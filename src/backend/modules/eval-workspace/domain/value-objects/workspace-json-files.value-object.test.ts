import { describe, expect, it } from "vitest";
import { WorkspaceJsonFiles } from "./workspace-json-files.value-object";

describe("WorkspaceJsonFiles", () => {
  it("returns a copy of the file paths", () => {
    const source = ["manifest.json"];
    const files = WorkspaceJsonFiles.fromPrimitives(source);
    source.push("other.json");

    expect(files.toPrimitives()).toEqual(["manifest.json"]);
  });
});
