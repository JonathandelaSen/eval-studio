import { describe, expect, it } from "vitest";
import { Producer } from "./producer.value-object";

describe("Producer", () => {
  it("trims and round-trips producer names", () => {
    expect(Producer.fromPrimitives(" eval-studio ").toPrimitives()).toBe("eval-studio");
  });

  it("identifies eval-studio correctly", () => {
    const producer = Producer.evalStudio();
    expect(producer.toPrimitives()).toBe("eval-studio");
    expect(producer.isEvalStudio()).toBe(true);
  });

  it("rejects invalid or empty producer names", () => {
    expect(() => Producer.fromPrimitives(" ")).toThrow();
    expect(() => Producer.fromPrimitives("other")).toThrow();
  });
});
