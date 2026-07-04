import { ValueObject } from "@/backend/modules/shared";

export interface EvalProviderRequestPrimitives {
  transport: "http" | "process" | "in-memory";
  target: string;
  contentType: "application/json" | "text/plain";
  body: unknown;
}

export class EvalProviderRequest extends ValueObject<unknown> {
  private constructor(
    private readonly value: EvalProviderRequestPrimitives | undefined,
  ) {
    super();
  }

  static fromPrimitives(
    value: EvalProviderRequestPrimitives | undefined,
  ): EvalProviderRequest {
    return new EvalProviderRequest(value);
  }

  static empty(): EvalProviderRequest {
    return new EvalProviderRequest(undefined);
  }

  toPrimitives(): EvalProviderRequestPrimitives | undefined {
    return this.value;
  }
}
