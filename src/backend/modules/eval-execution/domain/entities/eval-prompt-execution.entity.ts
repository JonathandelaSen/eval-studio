import { AggregateRoot } from "@/backend/modules/shared";
import type { EvalResultPrimitives } from "@/backend/modules/eval-workspace";
import { EvalLatencyMs } from "../value-objects/eval-latency-ms.value-object";
import { EvalParsedOutput } from "../value-objects/eval-parsed-output.value-object";
import { EvalRawOutput } from "../value-objects/eval-raw-output.value-object";
import { EvalUsage } from "../value-objects/eval-usage.value-object";

export interface EvalPromptExecutionPrimitives {
  rawOutput: string;
  parsedOutput: unknown;
  usage: EvalResultPrimitives["usage"];
  latencyMs: number;
}

export class EvalPromptExecution extends AggregateRoot {
  private constructor(
    private readonly rawOutputValue: EvalRawOutput,
    private readonly parsedOutputValue: EvalParsedOutput,
    private readonly usageValue: EvalUsage,
    private readonly latencyMsValue: EvalLatencyMs,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: EvalPromptExecutionPrimitives,
  ): EvalPromptExecution {
    return new EvalPromptExecution(
      EvalRawOutput.fromPrimitives(primitives.rawOutput),
      EvalParsedOutput.fromPrimitives(primitives.parsedOutput),
      EvalUsage.fromPrimitives(primitives.usage),
      EvalLatencyMs.fromPrimitives(primitives.latencyMs),
    );
  }

  toPrimitives(): EvalPromptExecutionPrimitives {
    return {
      rawOutput: this.rawOutputValue.toPrimitives(),
      parsedOutput: this.parsedOutputValue.toPrimitives(),
      usage: this.usageValue.toPrimitives(),
      latencyMs: this.latencyMsValue.toPrimitives(),
    };
  }
}
