import { AggregateRoot } from "@/backend/modules/shared";
import type { EvalResultPrimitives } from "@/backend/modules/eval-workspace";

export interface EvalPromptExecutionPrimitives {
  rawOutput: string;
  parsedOutput: unknown;
  usage: EvalResultPrimitives["usage"];
  latencyMs: number;
}

export class EvalPromptExecution extends AggregateRoot {
  private constructor(
    private readonly rawOutputValue: string,
    private readonly parsedOutputValue: unknown,
    private readonly usageValue: EvalResultPrimitives["usage"],
    private readonly latencyMsValue: number,
  ) {
    super();
    if (latencyMsValue < 0) {
      throw new Error("Latency cannot be negative.");
    }
  }

  static fromPrimitives(
    primitives: EvalPromptExecutionPrimitives,
  ): EvalPromptExecution {
    return new EvalPromptExecution(
      primitives.rawOutput,
      primitives.parsedOutput,
      primitives.usage,
      primitives.latencyMs,
    );
  }

  toPrimitives(): EvalPromptExecutionPrimitives {
    return {
      rawOutput: this.rawOutputValue,
      parsedOutput: this.parsedOutputValue,
      usage: this.usageValue,
      latencyMs: this.latencyMsValue,
    };
  }
}
