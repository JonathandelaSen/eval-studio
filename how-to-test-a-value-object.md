# How to Test a Value Object

This guide covers how to test a [Value Object](how-to-create-a-value-object.md). Value Objects are pure, immutable, and self-validating, which makes them the simplest domain element to test: no mocks, no I/O, no setup — just construct and assert.

---

## 1. What to Test

A Value Object's behaviour reduces to four kinds of assertion:

1. **Round-trip**: `fromPrimitives(x).toPrimitives()` returns the normalized value — including any normalization the constructor applies (trimming, casing, etc.).
2. **Invariants**: invalid or empty input throws. Each distinct rejection rule deserves its own assertion.
3. **Semantic constructors & checkers**: static factories (e.g. `evalStudio()`) produce the expected value, and boolean checkers (`isX()`) answer correctly.
4. **Equality** (where relevant): two instances with equal primitives are `equals()`, different ones are not.

For `Nullable` variants, additionally cover the empty/`null` case (`empty()`, `fromPrimitives(null)`).

---

## 2. Co-location Rule

`npm run rules:check` (see [verify-ddd-tests.mjs](scripts/verify-ddd-tests.mjs)) requires every `*.value-object.ts` to have a sibling `*.value-object.test.ts` in the same folder.

---

## 3. Reference Example (`Producer`)

From [producer.value-object.test.ts](src/backend/modules/eval-execution/domain/value-objects/producer.value-object.test.ts):

```typescript
import { describe, expect, it } from "vitest";
import { Producer } from "./producer.value-object";

describe("Producer", () => {
  // 1. Round-trip, including normalization (trimming).
  it("trims and round-trips producer names", () => {
    expect(Producer.fromPrimitives(" eval-studio ").toPrimitives()).toBe("eval-studio");
  });

  // 2. Semantic constructor + boolean checker.
  it("identifies eval-studio correctly", () => {
    const producer = Producer.evalStudio();
    expect(producer.toPrimitives()).toBe("eval-studio");
    expect(producer.isEvalStudio()).toBe(true);
  });

  // 3. Invariants: empty and out-of-set values are rejected.
  it("rejects invalid or empty producer names", () => {
    expect(() => Producer.fromPrimitives(" ")).toThrow();
    expect(() => Producer.fromPrimitives("other")).toThrow();
  });
});
```

---

## 4. Guidelines

* **No test doubles**: Value Objects have no dependencies. If you reach for a mock, the object is doing too much.
* **Assert on `toPrimitives()`**: it is the public, serializable shape. Avoid asserting on private fields.
* **One rule per assertion**: keep each invariant in its own `it`/`expect` so a failure points at the exact broken rule.
* **Test through the public factories**: never `new` the Value Object — drive it through `fromPrimitives()` and the semantic constructors, exactly as production code does.

---

## 5. Checklist

- [ ] Sibling `*.value-object.test.ts` exists.
- [ ] Round-trip (with normalization) asserted.
- [ ] Every invariant has a rejection assertion.
- [ ] Semantic constructors and `isX()` checkers covered.
- [ ] Nullable variant covers the empty/`null` case.
- [ ] No mocks or I/O.
- [ ] `npm run rules:check` passes.
