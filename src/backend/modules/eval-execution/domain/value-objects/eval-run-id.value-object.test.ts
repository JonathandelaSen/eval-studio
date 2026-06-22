import { describe, expect, it } from "vitest";
import { Timestamp } from "@/backend/modules/shared";
import { EvalRunId } from "./eval-run-id.value-object";
import { Producer } from "./producer.value-object";
import { EvalProvider } from "./eval-provider.value-object";
import { EvalModel } from "./eval-model.value-object";

describe("EvalRunId", () => {
  it("creates a provider and model scoped run id", () => {
    const evalRunId = EvalRunId.create({
      createdAt: Timestamp.fromPrimitives("2026-06-22T10:15:30.000Z"),
      producer: Producer.evalStudio(),
      provider: EvalProvider.openai(),
      model: EvalModel.fromPrimitives("GPT 5 Mini"),
    });

    expect(evalRunId.toPrimitives()).toBe("20260622T101530Z.eval-studio-openai-gpt-5-mini");
  });

  it("round-trips a non-empty id", () => {
    expect(EvalRunId.fromPrimitives("run-1").toPrimitives()).toBe("run-1");
  });
});
