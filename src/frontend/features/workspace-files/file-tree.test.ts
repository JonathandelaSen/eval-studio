import { describe, expect, it } from "vitest";
import { buildFileTree } from "./file-tree";

describe("buildFileTree", () => {
  it("turns workspace-relative paths into ordered directory nodes", () => {
    expect(
      buildFileTree([
        "runs/zeta/run.json",
        "manifest.json",
        "suites/refunds/cases/late.case.json",
        "runs/alpha/run.json",
      ]),
    ).toEqual([
      { kind: "file", name: "manifest.json", path: "manifest.json" },
      {
        kind: "directory",
        name: "runs",
        path: "runs",
        children: [
          {
            kind: "directory",
            name: "alpha",
            path: "runs/alpha",
            children: [
              {
                kind: "file",
                name: "run.json",
                path: "runs/alpha/run.json",
              },
            ],
          },
          {
            kind: "directory",
            name: "zeta",
            path: "runs/zeta",
            children: [
              {
                kind: "file",
                name: "run.json",
                path: "runs/zeta/run.json",
              },
            ],
          },
        ],
      },
      {
        kind: "directory",
        name: "suites",
        path: "suites",
        children: [
          {
            kind: "directory",
            name: "refunds",
            path: "suites/refunds",
            children: [
              {
                kind: "directory",
                name: "cases",
                path: "suites/refunds/cases",
                children: [
                  {
                    kind: "file",
                    name: "late.case.json",
                    path: "suites/refunds/cases/late.case.json",
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });
});
