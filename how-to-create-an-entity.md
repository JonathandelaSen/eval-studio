# How to Create an Entity

An **Entity** (or **Aggregate Root**) is a core building block in Domain-Driven Design (DDD). Unlike [Value Objects](how-to-create-a-value-object.md), an Entity has a conceptual **identity** that persists across changes to its attributes. Two entities with identical attributes but different identities are not equal.

In our architecture every domain entity is an **Aggregate Root**: the single, consistent entry point to a cluster of related Value Objects, responsible for protecting its own invariants and recording domain events.

---

## 1. Core Characteristics

* **Identity**: Each Entity carries an identity Value Object (e.g. `EvalRunId`). Equality is based on identity, never on attribute values.
* **Value-Object-Backed Fields**: Every field is a Value Object — never a raw primitive. This pushes validation down into the Value Objects and keeps the Entity focused on orchestration and invariants.
* **Controlled Construction**: Instances are never created with `new`. Construction goes through the static `create()` (new domain instance) or `fromPrimitives()` (reconstruction from persistence) factories.
* **Domain Events**: Meaningful state changes are recorded as domain events via `recordDomainEvent()` (inherited from `AggregateRoot`).

---

## 2. Code Validation Rules (DDD Checks)

Our architectural verification script (`npm run rules:check`, see [verify-ddd-entities.mjs](scripts/verify-ddd-entities.mjs)) enforces the following strict guidelines for files named `*.entity.ts` under `domain/entities/`:

1. **Must Extend `AggregateRoot`**: Every entity file must export a class extending `AggregateRoot`.
2. **Private or Protected Constructor**: Public instantiation via `new Entity()` is disallowed. Use `create()` or `fromPrimitives()`.
3. **`{Entity}Primitives` Interface**: The entity must export an interface named `{ClassName}Primitives` describing its plain serialized shape (primitives only).
4. **`{Entity}CreateParams` Interface with `id`**: When `create()` takes a parameter type other than `{ClassName}Primitives`, the entity must export an `{ClassName}CreateParams` interface, and that interface must include an `id` Value Object.
5. **`fromPrimitives()` and `toPrimitives()`**: The entity must define a static `fromPrimitives(primitives: {ClassName}Primitives)` and an instance `toPrimitives(): {ClassName}Primitives`.
6. **Every Field Backed by a Value Object**: `toPrimitives()` must delegate to a Value Object's `toPrimitives()` for every field. A field that serializes a raw primitive directly is a violation.
7. **No Nullable Value Object Unions**: A Value Object type may not be combined with `| null` or `| undefined`. Create a dedicated `Nullable` variant of the Value Object instead (e.g. `RunNotesNullable`).
8. **Associated Repository**: Each aggregate must have a corresponding `{ClassName}Repository` interface, which must use `save(entity)` rather than `create(...)`/`update(...)` and must not accept or return primitive/persistence types.

---

## 3. Reference Example: Aggregate Root (`EvalRun`)

Below is the complete implementation of the [EvalRun](src/backend/modules/eval-execution/domain/entities/eval-run.entity.ts) entity, which serves as the reference template for aggregate roots:

```typescript
import { AggregateRoot, Timestamp } from "@/backend/modules/shared";
import { ActionId } from "../value-objects/action-id.value-object";
import { CaseIds } from "../value-objects/case-ids.value-object";
import { Producer } from "../value-objects/producer.value-object";
import { EvalRunId } from "../value-objects/eval-run-id.value-object";
import { RunName } from "../value-objects/run-name.value-object";
import { RunNotesNullable } from "../value-objects/run-notes-nullable.value-object";
import { SuiteIdNullable } from "../value-objects/suite-id-nullable.value-object";
import { EvalRuntimeNullable } from "../value-objects/eval-runtime-nullable.value-object";
import type { EvalRuntimePrimitives } from "../value-objects/eval-runtime.value-object";
import { EvalRunCreatedEvent } from "../events/eval-run-created.event";

// 1. Primitives interface: the plain serialized shape (primitives only).
//    Nullable fields are expressed as `T | null` here — this is the one place
//    nullable unions are allowed.
export interface EvalRunPrimitives {
  runId: string;
  name: string;
  actionId: string;
  producer: string;
  createdAt: string;
  caseIds: string[];
  runtime: EvalRuntimePrimitives | null;
  notes: string | null;
  suiteId: string | null;
}

// 2. Create params interface: the Value-Object-typed inputs for a brand-new
//    instance. Must include an `id`. Nullability is handled by Nullable VOs.
export interface EvalRunCreateParams {
  id: EvalRunId;
  name: RunName;
  actionId: ActionId;
  producer: Producer;
  createdAt: Timestamp;
  caseIds: CaseIds;
  runtime: EvalRuntimeNullable;
  notes: RunNotesNullable;
  suiteId: SuiteIdNullable;
}

// 3. Entity extends AggregateRoot
export class EvalRun extends AggregateRoot {
  // 4. Private constructor: all fields are Value Objects, never primitives
  private constructor(
    private readonly evalRunIdValue: EvalRunId,
    private readonly nameValue: RunName,
    private readonly actionIdValue: ActionId,
    private readonly producerValue: Producer,
    private readonly createdAtValue: Timestamp,
    private readonly caseIdsValue: CaseIds,
    private readonly runtimeValue: EvalRuntimeNullable,
    private readonly notesValue: RunNotesNullable,
    private readonly suiteIdValue: SuiteIdNullable,
  ) {
    super();
  }

  // 5. Reconstruction from persistence: rehydrate each field via its VO
  static fromPrimitives(primitives: EvalRunPrimitives): EvalRun {
    return new EvalRun(
      EvalRunId.fromPrimitives(primitives.runId),
      RunName.fromPrimitives(primitives.name),
      ActionId.fromPrimitives(primitives.actionId),
      Producer.fromPrimitives(primitives.producer),
      Timestamp.fromPrimitives(primitives.createdAt),
      CaseIds.fromPrimitives(primitives.caseIds),
      EvalRuntimeNullable.fromPrimitives(primitives.runtime),
      RunNotesNullable.fromPrimitives(primitives.notes),
      SuiteIdNullable.fromPrimitives(primitives.suiteId),
    );
  }

  // 6. Creation of a new domain instance: records a domain event
  static create(input: EvalRunCreateParams): EvalRun {
    const evalRun = new EvalRun(
      input.id,
      input.name,
      input.actionId,
      input.producer,
      input.createdAt,
      input.caseIds,
      input.runtime,
      input.notes,
      input.suiteId,
    );
    evalRun.recordDomainEvent(new EvalRunCreatedEvent(evalRun.toPrimitives()));
    return evalRun;
  }

  // 7. Identity and any other behaviour exposed via getters returning VOs
  get id(): EvalRunId {
    return this.evalRunIdValue;
  }

  get actionId(): ActionId {
    return this.actionIdValue;
  }

  // 8. Serialization: delegate to each Value Object's toPrimitives()
  toPrimitives(): EvalRunPrimitives {
    return {
      runId: this.evalRunIdValue.toPrimitives(),
      name: this.nameValue.toPrimitives(),
      actionId: this.actionIdValue.toPrimitives(),
      producer: this.producerValue.toPrimitives(),
      createdAt: this.createdAtValue.toPrimitives(),
      caseIds: this.caseIdsValue.toPrimitives(),
      runtime: this.runtimeValue.toPrimitives(),
      notes: this.notesValue.toPrimitives(),
      suiteId: this.suiteIdValue.toPrimitives(),
    };
  }
}
```

---

## 4. Testing an Entity

Entities are pure (no I/O) but carry identity, compose Value Objects, and record domain events. Tests use **real** Value Objects — no mocks — and focus on:

* **`create()` with domain defaults**: assert the resulting primitives and that identity is derived correctly (use `toMatchObject()` for partial assertions when fields like `createdAt`/`id` are generated).
* **Domain events**: `create()` (and any state change) records the expected event — pull them via `pullDomainEvents()` and assert `eventName` and payload.
* **`fromPrimitives()` round-trip**: rehydration restores identity and every field, and `toPrimitives()` returns the same shape.

Cover both factories (`create()` and `fromPrimitives()`) — they exercise different paths. `npm run rules:check` requires a sibling `*.entity.test.ts`.

For the full guide and reference example, see [How to Test an Entity](how-to-test-an-entity.md).

---

## 5. Checklist

Before considering an entity complete, verify:

- [ ] Class extends `AggregateRoot`.
- [ ] Constructor is `private` (or `protected`), with every parameter a Value Object.
- [ ] `{ClassName}Primitives` interface is exported.
- [ ] `{ClassName}CreateParams` interface is exported and includes `id`.
- [ ] Static `create()` records the relevant domain event.
- [ ] Static `fromPrimitives()` rehydrates every field through a Value Object.
- [ ] `toPrimitives()` delegates to each field's `toPrimitives()`.
- [ ] No field is typed as a nullable Value Object union — use a `Nullable` Value Object.
- [ ] A matching `{ClassName}Repository` interface exists using `save(entity)`.
- [ ] `npm run rules:check` passes.
```