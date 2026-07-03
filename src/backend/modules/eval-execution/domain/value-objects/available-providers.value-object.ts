import { ValueObject } from "@/backend/modules/shared";

export type AvailableProviderPrimitives = {
  id: "ollama" | "apple";
  label: string;
  available: boolean;
  reason?: string;
  models: Array<{ id: string; label: string; digest?: string }>;
};

export class AvailableProviders extends ValueObject<unknown> {
  private constructor(private readonly value: AvailableProviderPrimitives[]) { super(); }
  static fromPrimitives(value: AvailableProviderPrimitives[]): AvailableProviders {
    return new AvailableProviders(value);
  }
  toPrimitives(): AvailableProviderPrimitives[] { return this.value.map((item) => ({ ...item, models: item.models.map((model) => ({ ...model })) })); }
}
