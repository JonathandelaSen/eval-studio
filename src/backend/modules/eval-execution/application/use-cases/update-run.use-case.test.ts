import { describe, expect, it } from "vitest";
import { UpdateRunUseCase } from "./update-run.use-case";
import { EvalRun, type EvalRunPrimitives } from "../../domain/entities/eval-run.entity";
import { RunNotFoundError } from "../../domain/errors/run-not-found.error";
import type { EvalRunRepository } from "../../domain/repositories/eval-run.repository";

const runPrimitives: EvalRunPrimitives = {
  runId: "20260701T000000Z.eval-studio-mock-mock-evaluator",
  name: "Baseline",
  actionId: "550e8400-e29b-41d4-a716-446655440000",
  producer: "eval-studio",
  createdAt: "2026-07-01T00:00:00.000Z",
  caseIds: ["550e8400-e29b-41d4-a716-446655440001"],
  runtime: { provider: "mock", model: "mock-evaluator", temperature: 0 },
  notes: null,
  suiteId: null,
};

function repositoryWith(existing: EvalRunPrimitives | null): {
  repo: EvalRunRepository;
  saved: () => EvalRunPrimitives | undefined;
} {
  let savedRun: EvalRun | undefined;
  const repo: EvalRunRepository = {
    save: async (_workspaceRoot, run) => {
      savedRun = run;
      return run;
    },
    find: async () => {
      if (!existing) throw new RunNotFoundError();
      return EvalRun.fromPrimitives(existing);
    },
    delete: async (_workspaceRoot, runId) => runId,
  };
  return { repo, saved: () => savedRun?.toPrimitives() };
}

describe("UpdateRunUseCase", () => {
  it("renames the run and keeps the remaining fields", async () => {
    const { repo, saved } = repositoryWith(runPrimitives);

    const updated = await new UpdateRunUseCase({ runRepository: repo }).execute({
      workspaceRoot: "/tmp/workspace",
      runId: runPrimitives.runId,
      name: "Renamed run",
    });

    expect(updated.toPrimitives().name).toBe("Renamed run");
    expect(saved()?.name).toBe("Renamed run");
    expect(saved()?.notes).toBeNull();
    expect(saved()?.caseIds).toEqual(["550e8400-e29b-41d4-a716-446655440001"]);
  });

  it("updates notes and clears them with null", async () => {
    const { repo, saved } = repositoryWith({ ...runPrimitives, notes: "old" });

    await new UpdateRunUseCase({ runRepository: repo }).execute({
      runId: runPrimitives.runId,
      notes: "Follow-up review pending",
    });
    expect(saved()?.notes).toBe("Follow-up review pending");
    expect(saved()?.name).toBe("Baseline");

    await new UpdateRunUseCase({ runRepository: repo }).execute({
      runId: runPrimitives.runId,
      notes: null,
    });
    expect(saved()?.notes).toBeNull();
  });

  it("rejects an empty name", async () => {
    const { repo } = repositoryWith(runPrimitives);

    await expect(
      new UpdateRunUseCase({ runRepository: repo }).execute({
        runId: runPrimitives.runId,
        name: "   ",
      }),
    ).rejects.toThrow();
  });

  it("fails when the run does not exist", async () => {
    const { repo } = repositoryWith(null);

    await expect(
      new UpdateRunUseCase({ runRepository: repo }).execute({
        runId: "missing",
        name: "Renamed",
      }),
    ).rejects.toThrow(RunNotFoundError);
  });
});
