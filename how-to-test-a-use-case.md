# How to Test a Use Case

This guide covers how to test a [Use Case](how-to-create-a-use-case.md). Unlike [Value Objects](how-to-test-a-value-object.md) and [Entities](how-to-test-an-entity.md), which are pure, a use case orchestrates repositories and the event bus — so its tests run the real orchestration end-to-end and assert on **observable outcomes**: persisted artifacts and published events.

---

## 1. What to Test

Drive the use case through its public `execute()` method and cover **every branch**:

1. **Happy path**: the aggregate is persisted, one result per selected item is written, and the expected events are published in order.
2. **Input filtering / mapping**: input that selects a subset (e.g. `caseIds`) runs only the selected items and ignores the rest.
3. **Failure handling**: when a collaborator fails, the failure is modelled in the domain (a failed result + failure event), not thrown away.
4. **Optional fields**: present *and* absent — assert what the use case forwards to its collaborators in each case.

A use case is "complete" when each branch of `execute()` and its private helpers is exercised.

---

## 2. Choosing Collaborators

* **Real collaborators where cheap**: prefer real repositories backed by a temp directory (`FilesystemEvalRunRepository`, `FilesystemEvalResultRepository` over an `mkdtemp` root) and the real `InMemoryEventBus`. This lets you assert against the actual persisted JSON and the real event stream instead of "was this method called".
* **Test doubles for the boundary**: substitute only the external port (the provider) to reach paths you can't otherwise trigger:
  * a **throwing** double to drive the failure branch, and
  * a **recording** double (wrapping the real one) to assert what the use case forwarded.
* **Assert on outcomes, not implementation**: check the persisted artifact's `status`, the count and `eventName` of published events, and the returned Entity's primitives — never internal call counts.

---

## 3. Co-location Rule

`npm run rules:check` (see [verify-ddd-tests.mjs](scripts/verify-ddd-tests.mjs)) requires every `*.use-case.ts` to have a sibling `*.use-case.test.ts` in the same folder.

---

## 4. Reference Example (`CreateRunUseCase`)

From [create-run.use-case.test.ts](src/backend/modules/eval-execution/application/use-cases/create-run.use-case.test.ts).

### Test doubles for the external port

```typescript
// Throwing double: drives the failure branch of runCase().
class ThrowingEvalProviderRepository implements EvalProviderRepository {
  constructor(private readonly message: string) {}
  execute(_input: EvalProviderExecutionInput): Promise<EvalPromptExecution> {
    return Promise.reject(new Error(this.message));
  }
}

// Recording double: wraps the real one and captures forwarded inputs.
class RecordingEvalProviderRepository implements EvalProviderRepository {
  readonly inputs: EvalProviderExecutionInput[] = [];
  constructor(private readonly delegate: EvalProviderRepository) {}
  execute(input: EvalProviderExecutionInput): Promise<EvalPromptExecution> {
    this.inputs.push(input);
    return this.delegate.execute(input);
  }
}
```

### Real infrastructure, injectable provider

```typescript
beforeEach(async () => {
  workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "eval-studio-"));
  eventBus = new InMemoryEventBus(new NoOpTelemetry());
});
afterEach(async () => {
  await rm(workspaceRoot, { recursive: true, force: true });
});

function buildUseCase(
  providerRepository: EvalProviderRepository = new MockEvalProviderRepository(),
) {
  return new CreateRunUseCase({
    providerRepository,
    runRepository: new FilesystemEvalRunRepository(workspaceRoot),
    resultRepository: new FilesystemEvalResultRepository(workspaceRoot),
    eventBus,
  });
}
```

### Asserting on persisted artifacts and published events

```typescript
// Happy path: persisted result + ordered events.
it("persists the run and one completed result per selected case", async () => {
  const run = await buildUseCase().execute(buildInput());
  const runId = run.toPrimitives().runId;

  const resultArtifact = await readFile(
    path.join(workspaceRoot, "runs", runId, "results", `${caseUuid}.result.json`),
    "utf8",
  );
  expect(JSON.parse(resultArtifact).status).toBe("completed");

  const publishedEvents = eventBus.getEvents();
  expect(publishedEvents).toHaveLength(2);
  expect(publishedEvents[0].eventName).toBe("eval_execution.run_created.1");
  expect(publishedEvents[1].eventName).toBe("eval_execution.result_completed.1");
});

// Failure branch: failed status + failure event.
it("records a failed result when the provider throws", async () => {
  const run = await buildUseCase(
    new ThrowingEvalProviderRepository("provider exploded"),
  ).execute(buildInput());
  const runId = run.toPrimitives().runId;

  const resultArtifact = await readFile(
    path.join(workspaceRoot, "runs", runId, "results", `${caseUuid}.result.json`),
    "utf8",
  );
  expect(JSON.parse(resultArtifact).status).toBe("failed");
  expect(eventBus.getEvents()[1].eventName).toBe("eval_execution.result_failed.1");
});

// Optional field, both branches: assert what was forwarded.
it("forwards the configured temperature to the provider", async () => {
  const provider = new RecordingEvalProviderRepository(new MockEvalProviderRepository());
  await buildUseCase(provider).execute(buildInput({ temperature: 0.7 }));
  expect(provider.inputs[0].temperature?.toPrimitives()).toBe(0.7);
});
```

A small `buildInput(overrides)` factory keeps each test focused on the one field it varies (`caseIds`, `temperature`, the set of `cases`).

---

## 5. Checklist

- [ ] Sibling `*.use-case.test.ts` exists.
- [ ] Driven through the public `execute()` method only.
- [ ] Real repositories (temp dir) and real `InMemoryEventBus` used where cheap.
- [ ] External ports substituted with throwing / recording doubles as needed.
- [ ] Every branch covered: happy path, filtering, failure, optional fields (present + absent).
- [ ] Assertions on persisted artifacts, event names/order, and returned primitives — not call counts.
- [ ] `npm run rules:check` passes.
