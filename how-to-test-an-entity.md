# How to Test an Entity

This guide covers how to test an [Entity / Aggregate Root](how-to-create-an-entity.md). Entities are still pure (no I/O), but unlike [Value Objects](how-to-test-a-value-object.md) they carry identity, compose many Value Objects, and record domain events — so the tests focus on construction, serialization round-trips, and the events emitted on creation.

---

## 1. What to Test

1. **`create()` with domain defaults**: building a brand-new aggregate produces the expected primitives, and identity is derived correctly.
2. **Domain events**: `create()` records the expected event(s). Pull them (`pullDomainEvents()`) and assert the event name and payload.
3. **`fromPrimitives()` round-trip**: rehydrating from persistence restores identity and every field, and `toPrimitives()` returns the same shape it was given.
4. **Behaviour & invariants**: any method that changes state or enforces a rule gets its own assertion, including the events such state changes record.

Use `toMatchObject()` when you only care about a subset of fields (e.g. a generated `createdAt` or `id` you don't want to pin exactly).

---

## 2. Co-location Rule

`npm run rules:check` (see [verify-ddd-tests.mjs](scripts/verify-ddd-tests.mjs)) requires every `*.entity.ts` to have a sibling `*.entity.test.ts` in the same folder.

---

## 3. Reference Example (`EvalRun`)

From [eval-run.entity.test.ts](src/backend/modules/eval-execution/domain/entities/eval-run.entity.test.ts):

```typescript
import { describe, expect, it } from "vitest";
import { Timestamp } from "@/backend/modules/shared";
import { EvalRun } from "./eval-run.entity";
// ...real Value Object imports...

describe("EvalRun", () => {
  // 1. create(): assert resulting primitives and derived identity.
  it("creates a run with domain defaults", () => {
    const createdAt = Timestamp.fromPrimitives("2026-06-22T10:15:30.000Z");
    const producer = Producer.evalStudio();
    const evalRun = EvalRun.create({
      id: EvalRunId.create({
        createdAt,
        producer,
        provider: EvalProvider.openai(),
        model: EvalModel.fromPrimitives("gpt-5 mini"),
      }),
      name: RunName.fromPrimitives("Run 1"),
      /* ...remaining Value Object fields... */
      runtime: EvalRuntimeNullable.fromPrimitives({ provider: "openai", model: "gpt-5 mini" }),
      notes: RunNotesNullable.empty(),
      suiteId: SuiteIdNullable.empty(),
    });

    // Assert a subset — the generated id is checked separately.
    expect(evalRun.toPrimitives()).toMatchObject({
      name: "Run 1",
      producer: "eval-studio",
      runtime: { provider: "openai", model: "gpt-5 mini" },
    });
    expect(evalRun.id.toPrimitives()).toContain(".eval-studio-openai-gpt-5-mini");
  });

  // 2. fromPrimitives(): hydrate identity and round-trip.
  it("hydrates identities and round-trips primitives", () => {
    const run = EvalRun.fromPrimitives({
      runId: "run-1",
      name: "Run 1",
      /* ...remaining primitive fields, nullable ones as null... */
      runtime: null,
      notes: null,
      suiteId: null,
    });

    expect(run.id.toPrimitives()).toBe("run-1");
    expect(run.toPrimitives().caseIds).toEqual([/* ... */]);
  });
});
```

> To assert domain events, call `pullDomainEvents()` on the created entity and check the `eventName` and `toPrimitives()` of each — the same events the use case publishes (see [how-to-test-a-use-case.md](how-to-test-a-use-case.md)).

---

## 4. Guidelines

* **Use real Value Objects**: construct the entity exactly as production code does — through `create()`/`fromPrimitives()` with real Value Objects. No mocks; the domain has no dependencies to mock.
* **Assert on `toPrimitives()`**: it is the stable serialized contract. Use `toMatchObject()` for partial assertions when some fields are generated.
* **Cover both factories**: `create()` (new instance + events) and `fromPrimitives()` (rehydration) exercise different code paths — test both.
* **Pin identity deliberately**: when `id` is derived, assert its meaningful structure (`toContain`) rather than an exact string that may be timestamp-dependent.

---

## 5. Checklist

- [ ] Sibling `*.entity.test.ts` exists.
- [ ] `create()` asserts resulting primitives and derived identity.
- [ ] Domain events recorded by `create()` (and state changes) are asserted.
- [ ] `fromPrimitives()` round-trip restores identity and all fields.
- [ ] Real Value Objects used throughout — no mocks.
- [ ] `npm run rules:check` passes.
