import { describe, expect, it } from "vitest";
import { Producer } from "./producer.value-object";

describe("Producer", () => {
  it("trims and round-trips producer names", () => {
    expect(Producer.fromPrimitives(" eval-studio ").toPrimitives()).toBe("eval-studio");
  });
});
