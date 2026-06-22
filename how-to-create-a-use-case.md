# How to Create a Use Case

A **Use Case** is the application-layer entry point that orchestrates a single piece of domain behaviour. It coordinates [Entities](how-to-create-an-entity.md), [Value Objects](how-to-create-a-value-object.md), repositories, and the event bus to fulfil one intention of the system (e.g. "create a run"). Use cases contain orchestration logic only — they hold no business invariants of their own; those live in the domain.

---

## 1. Core Characteristics

* **Single Responsibility**: One use case fulfils exactly one application intention, exposed through a single `execute()` method.
* **Dependencies via Constructor**: All collaborators (repositories, event bus, other ports) are injected through a single `deps` object in the constructor. The use case depends on domain interfaces, never on concrete infrastructure.
* **Primitive Input, Domain Output**: `execute()` accepts a plain `{UseCase}Input` type of primitives (the boundary with the outside world) and returns an Entity or Value Object — never primitives or an inline object.
* **Translation at the Edge**: The use case converts primitives into Value Objects, drives the domain, persists through repositories, and publishes the domain events the entities recorded.
* **No Business Rules**: Validation and invariants belong in Value Objects and Entities. The use case only sequences calls; it does not re-implement domain logic.

---

## 2. Code Validation Rules (DDD Checks)

Our architectural verification script (`npm run rules:check`, see [verify-ddd-use-cases-return-types.mjs](scripts/verify-ddd-use-cases-return-types.mjs)) enforces the following for files named `*.use-case.ts` under `application/use-cases/`:

1. **Must Expose `execute()`**: Every use case class must define an `execute` method.
2. **Explicit Return Type**: `execute()` must declare an explicit return type — inference is not allowed.
3. **Domain Return Type**: `execute()` must return an Entity or Value Object (optionally wrapped in `Promise`). Returning a primitive (`string`, `number`, `void`, …), an inline object structure, or a type declared locally in the same file is a violation.

---

## 3. Reference Example: Use Case (`CreateRunUseCase`)

Below is the [CreateRunUseCase](src/backend/modules/eval-execution/application/use-cases/create-run.use-case.ts), which serves as the reference template. It translates primitive input into Value Objects, creates and persists the `EvalRun` aggregate, executes each selected case against the provider, and publishes the recorded domain events.

```typescript
import { Timestamp, type EventBus } from "@/backend/modules/shared";
import { EvalResult } from "../../domain/entities/eval-result.entity";
import { EvalRun } from "../../domain/entities/eval-run.entity";
// ...Value Object imports...
import type { EvalProviderRepository } from "../../domain/repositories/eval-provider.repository";
import type { EvalRunRepository } from "../../domain/repositories/eval-run.repository";
import type { EvalResultRepository } from "../../domain/repositories/eval-result.repository";

// 1. Input type: plain primitives — the boundary with the outside world.
export type CreateRunInput = {
  name: string;
  actionId: string;
  caseIds: string[];
  cases: EvalCase[];
  provider: EvalProviderPrimitives;
  model: string;
  temperature?: number;
};

// 2. Use case class.
export class CreateRunUseCase {
  // 3. Dependencies injected through a single `deps` object, typed as
  //    domain interfaces (repositories, event bus) — never concrete classes.
  constructor(
    private readonly deps: {
      providerRepository: EvalProviderRepository;
      runRepository: EvalRunRepository;
      resultRepository: EvalResultRepository;
      eventBus: EventBus;
    },
  ) {}

  // 4. Single `execute()` with an explicit domain return type (EvalRun).
  async execute(input: CreateRunInput): Promise<EvalRun> {
    const context = this.buildContext(input);
    const evalRun = await this.createRun(input, context);

    // 5. Drive the domain, persist via repositories, then publish the
    //    domain events each entity recorded during the operation.
    for (const testCase of context.cases) {
      const evalResult = await this.runCase(testCase, evalRun, context);
      await this.deps.resultRepository.save(evalResult);
      await this.deps.eventBus.publish(evalResult.pullDomainEvents());
    }

    return evalRun;
  }

  // 6. Private helpers translate primitives into Value Objects and keep
  //    `execute()` readable. They hold orchestration only — no business rules.
  private buildContext(input: CreateRunInput): RunContext {
    /* map input primitives into Value Objects */
  }

  private async createRun(input: CreateRunInput, context: RunContext): Promise<EvalRun> {
    const evalRun = EvalRun.create({ /* Value Object fields */ });
    await this.deps.runRepository.save(evalRun);
    await this.deps.eventBus.publish(evalRun.pullDomainEvents());
    return evalRun;
  }

  private async runCase(/* ... */): Promise<EvalResult> {
    try {
      const output = await this.deps.providerRepository.execute({ /* ... */ });
      return EvalResult.createSuccess({ /* ... */ });
    } catch (error) {
      // 7. Failure is modelled in the domain (a failed result), not thrown away.
      return EvalResult.createFailed({ /* ... */ });
    }
  }
}
```

---

## 4. Testing a Use Case

Use cases are tested through their public `execute()` method against **real** domain objects and lightweight infrastructure, asserting on observable outcomes — persisted artifacts and published events. See [create-run.use-case.test.ts](src/backend/modules/eval-execution/application/use-cases/create-run.use-case.test.ts).

* **Real collaborators where cheap**: prefer real repositories backed by a temp directory (`FilesystemEvalRunRepository`) and the real `InMemoryEventBus` over mocks — assert against actual persisted JSON and the real event stream.
* **Test doubles for the boundary**: substitute the external port (the provider) to exercise paths you can't trigger otherwise — e.g. a `ThrowingEvalProviderRepository` to drive the failure branch, or a `RecordingEvalProviderRepository` to assert what the use case forwarded.
* **Cover every branch**: happy path, input filtering, failure handling, and optional fields (both present and absent). A use case is "complete" when each branch of `execute()` and its helpers is exercised.
* **Assert on outcomes, not implementation**: check the persisted artifact's `status`, the count and `eventName` of published events, and the returned Entity's primitives — not internal calls.

For the full guide and reference example, see [How to Test a Use Case](how-to-test-a-use-case.md).

---

## 5. Checklist

Before considering a use case complete, verify:

- [ ] Exactly one application intention, exposed via a single `execute()` method.
- [ ] Dependencies injected through a single `deps` object, typed as domain interfaces.
- [ ] `{UseCase}Input` type of primitives at the boundary.
- [ ] `execute()` has an explicit return type that is an Entity or Value Object.
- [ ] Primitives are translated into Value Objects before touching the domain.
- [ ] Recorded domain events are published after persistence via the event bus.
- [ ] No business rules or invariants live in the use case.
- [ ] Tests cover every branch through `execute()` (success, filtering, failure, optional fields).
- [ ] `npm run rules:check` passes.
