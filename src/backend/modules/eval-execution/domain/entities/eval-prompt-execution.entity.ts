import { AggregateRoot } from "@/backend/modules/shared";
import { EvalLatencyMs } from "../value-objects/eval-latency-ms.value-object";
import { EvalParsedOutput } from "../value-objects/eval-parsed-output.value-object";
import { EvalRawOutput } from "../value-objects/eval-raw-output.value-object";
import { EvalUsageNullable } from "../value-objects/eval-usage-nullable.value-object";

export interface EvalPromptExecutionPrimitives {
  rawOutput: string;
  parsedOutput: unknown;
  usage: unknown | null;
  latencyMs: number;
  effectiveRuntime?: {
    model?: string;
    modelDigest?: string;
    systemVersion?: string;
  };
}

export class EvalPromptExecution extends AggregateRoot {
  private constructor(
    private readonly rawOutputValue: EvalRawOutput,
    private readonly parsedOutputValue: EvalParsedOutput,
    private readonly usageValue: EvalUsageNullable,
    private readonly latencyMsValue: EvalLatencyMs,
    private readonly effectiveRuntimeValue?: EvalPromptExecutionPrimitives["effectiveRuntime"],
  ) {
    super();
  }

  static fromPrimitives(
    primitives: EvalPromptExecutionPrimitives,
  ): EvalPromptExecution {
    return new EvalPromptExecution(
      EvalRawOutput.fromPrimitives(primitives.rawOutput),
      EvalParsedOutput.fromPrimitives(primitives.parsedOutput),
      EvalUsageNullable.fromPrimitives(primitives.usage),
      EvalLatencyMs.fromPrimitives(primitives.latencyMs),
      primitives.effectiveRuntime,
    );
  }

  toPrimitives(): EvalPromptExecutionPrimitives {
    return {
      rawOutput: this.rawOutputValue.toPrimitives(),
      parsedOutput: this.parsedOutputValue.toPrimitives(),
      usage: this.usageValue.toPrimitives(),
      latencyMs: this.latencyMsValue.toPrimitives(),
      ...(this.effectiveRuntimeValue ? { effectiveRuntime: this.effectiveRuntimeValue } : {}),
    };
  }
}
