import { describe, expect, it } from "vitest";
import { WorkspaceJsonFile } from "./workspace-json-file.value-object";

describe("WorkspaceJsonFile", () => {
  it("round-trips a nested JSON file without changing its raw content", () => {
    const raw = '{\n  "enabled": true\n}\n';

    expect(
      WorkspaceJsonFile.fromPrimitives({
        path: "suites/refunds/suite.json",
        content: raw,
      }).toPrimitives(),
    ).toEqual({ path: "suites/refunds/suite.json", content: raw });
  });

  it.each(["", "../secret.json", "/tmp/secret.json", "notes.txt"])(
    "rejects unsafe or non-JSON paths: %s",
    (filePath) => {
      expect(() =>
        WorkspaceJsonFile.fromPrimitives({ path: filePath, content: "{}" }),
      ).toThrow("Choose a JSON file inside the workspace.");
    },
  );

  it("rejects invalid JSON when creating an editable version", () => {
    expect(() =>
      WorkspaceJsonFile.fromValidJson({
        path: "manifest.json",
        content: '{ "workspaceName": ',
      }),
    ).toThrow("The file must contain valid JSON.");
  });
});
