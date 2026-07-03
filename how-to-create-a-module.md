# How to Create a Module

A **module** is the implementation boundary for one domain capability. It owns
the language, domain model, use cases, repository ports, and infrastructure
needed to provide that capability.

Modules live under `src/backend/modules/<module-name>/`. Name them after the
domain objects (nouns representing domain concepts) they represent, not after
actions, verbs, or capability management. For example, use `project` instead of
`project-management`.

---

## 1. When to Create a Module

Create a module when a concept represents a domain capability and has one or
more of these characteristics:

* **Identity or lifecycle**: instances are created, selected, changed, archived,
  or removed over time.
* **Persisted state**: the application must remember the concept between
  requests or restarts.
* **Business rules or invariants**: valid changes depend on rules such as
  uniqueness, ownership, allowed transitions, or fallback behaviour.
* **Application intentions**: users or other systems perform named operations
  such as add, select, execute, annotate, or remove.
* **Owned external interaction**: the capability needs repository ports and
  adapters for files, databases, providers, or other systems.
* **Independent evolution**: the vocabulary and rules can change without
  forcing unrelated capabilities to change with it.

One strong signal can be sufficient. A concept does not need complicated rules
before it belongs to the domain.

### Decision test

Ask these questions before adding stateful code to `src/lib`, an API route, or a
UI component:

1. Does this concept have a stable name in the product language?
2. Does it have identity, persisted state, or a lifecycle?
3. Can a user express an intention that changes it?
4. Are there rules that should remain true regardless of the caller?
5. Would more than one entry point need the same behaviour?

If any answer is **yes**, start by identifying the owning module. Create a new
module when no existing bounded context clearly owns the capability.

### Example: Project

`Project` is not merely UI settings when Eval Studio can add, select, list, and
remove projects and persist their directories. It has identity and lifecycle,
and rules such as directory uniqueness and active-project fallback. It therefore
belongs in a domain module, for example `project`, with use cases and
a repository port.

It must not be implemented as a stateful registry under `src/lib` or directly
inside `/api/projects`.

### When not to create a module

Do not create a feature module for:

* Pure, stateless technical helpers with no domain vocabulary or rules.
* Framework bootstrapping and dependency composition.
* Generic primitives shared by several modules, such as the event bus,
  telemetry ports, `AggregateRoot`, or base Value Objects. These belong in the
  `shared` module.
* A second folder for behaviour already clearly owned by an existing module.
  Extend that module instead.

`src/lib` is reserved for composition and genuinely technical glue. It must not
own persisted application state, domain invariants, or repository
implementations.

---

## 2. Define the Boundary Before the Files

Write down:

* The capability the module owns.
* Its canonical terms.
* Its aggregates and their identities.
* The intentions exposed as use cases.
* The data or systems it owns through repository ports.
* What explicitly belongs to another module.

Prefer a domain-oriented name (domain object/noun) such as `project` over a vague
technical name such as `settings-store` or action-oriented names like `project-management`. Do not create one module per table,
endpoint, entity, or screen.

---

## 3. Folder Structure

Use this structure, adding only folders the capability needs:

```text
src/backend/modules/project/
  domain/
    entities/
      project.entity.ts
      project.entity.test.ts
    value-objects/
      project-id.value-object.ts
      project-id.value-object.test.ts
      project-directory.value-object.ts
      project-directory.value-object.test.ts
    repositories/
      project.repository.ts
    events/
      project-added.event.ts
  application/
    use-cases/
      add-project.use-case.ts
      add-project.use-case.test.ts
      list-projects.use-case.ts
      list-projects.use-case.test.ts
      select-project.use-case.ts
      select-project.use-case.test.ts
      remove-project.use-case.ts
      remove-project.use-case.test.ts
  infrastructure/
    repositories/
      filesystem-project.repository.ts
      filesystem-project.repository.test.ts
  project.module.ts
  index.ts
```

The layers have strict responsibilities:

* **Domain** owns vocabulary, identity, invariants, events, and repository ports.
* **Application** owns use cases that orchestrate the domain through ports.
* **Infrastructure** implements ports using files, databases, providers, or
  frameworks.
* **Composition** wires concrete adapters into use cases.

Dependencies point inward: infrastructure and composition may depend on the
domain; the domain must not depend on application or infrastructure.

---

## 4. Build the Domain Model

Follow the existing guides rather than placing primitive records directly in a
repository:

1. Create Value Objects for identity and validated fields using
   [How to Create a Value Object](how-to-create-a-value-object.md).
2. Create each aggregate using
   [How to Create an Entity](how-to-create-an-entity.md).
3. Define one repository port for each aggregate that the module persists.
4. Record domain events for meaningful state changes.

Repository ports belong to the aggregate they persist. A repository must not
save a foreign aggregate; use that aggregate's own repository instead.

---

## 5. Add Use Cases

Each user or system intention gets a single application-layer use case. Follow
[How to Create a Use Case](how-to-create-a-use-case.md).

For project management, examples are:

* `AddProjectUseCase`
* `ListProjectsUseCase`
* `SelectProjectUseCase`
* `RemoveProjectUseCase`

Use cases accept primitive input, construct Value Objects, invoke aggregate
behaviour, persist through repository ports, publish recorded events, and return
domain types. They must not import concrete infrastructure.

API routes, server actions, and UI components call use cases through the module
factory. They must not call repositories directly or reproduce domain rules.

---

## 6. Implement Infrastructure Adapters

Put concrete persistence and external-system code under `infrastructure/`.
Adapters implement domain ports and translate between storage formats and
domain objects.

Examples include:

* Filesystem repositories.
* Database repositories.
* AI provider adapters.
* External API clients implementing a domain port.

Keep serialization, paths, atomic writes, database queries, and SDK-specific
types out of entities and use cases.

---

## 7. Create the Composition Factory

Add `<module-name>.module.ts` at the module root. This is the only place inside
the feature module that constructs concrete infrastructure for its use cases.

```typescript
import { AddProjectUseCase } from "./application/use-cases/add-project.use-case";
import { ListProjectsUseCase } from "./application/use-cases/list-projects.use-case";
import { FilesystemProjectRepository } from "./infrastructure/repositories/filesystem-project.repository";

export function createProjectModule(config: {
  settingsFile: string;
}) {
  const projectRepository = new FilesystemProjectRepository(config.settingsFile);

  return {
    addProject: new AddProjectUseCase({ projectRepository }),
    listProjects: new ListProjectsUseCase({ projectRepository }),
  };
}
```

The application composition root, currently `src/lib/container.ts`, may create
or expose module factories. It must not absorb the module's repositories,
business rules, or state transitions.

---

## 8. Define the Public API

Add an `index.ts` barrel that exposes only what other modules or entry points
are allowed to use:

```typescript
export { createProjectModule } from "./project.module";
export { Project } from "./domain/entities/project.entity";
export type { ProjectPrimitives } from "./domain/entities/project.entity";
```

Do not re-export:

* Infrastructure implementations.
* Repository port interfaces.
* Internal helpers.

Cross-module consumers import from `@/backend/modules/<module-name>`, never from
another module's internal layer.

---

## 9. Testing

Use the matching testing guides for Value Objects, entities, and use cases.
Additionally:

* Test infrastructure adapters against real temporary storage when practical.
* Assert persisted outcomes, returned domain objects, and published events.
* Cover lifecycle and invariant branches, not only the happy path.
* Keep tests next to the code they verify.

Follow TDD: write the failing test, confirm the expected failure, implement the
minimum behaviour, and run the test again.

---

## 10. Verification Checklist

Before considering a module complete:

- [ ] The module owns one clearly named domain capability.
- [ ] The decision to create or extend a module is documented.
- [ ] Persisted concepts with identity are entities backed by Value Objects.
- [ ] Every aggregate has its own repository port.
- [ ] Every application intention is exposed through a use case.
- [ ] Use cases depend on ports, not concrete infrastructure.
- [ ] Infrastructure adapters remain under `infrastructure/`.
- [ ] The module factory performs dependency composition.
- [ ] `index.ts` exposes no repositories or infrastructure internals.
- [ ] API routes and UI do not own domain rules or access repositories directly.
- [ ] Cross-module imports use the target module barrel.
- [ ] Tests cover domain rules, use-case branches, and persistence adapters.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes without new warnings.
- [ ] `npm test` passes.
- [ ] `npm run rules:check` passes without new violations.

---

## 11. Common Mistakes

* Treating persisted product concepts as “just settings” and putting them in
  `src/lib`.
* Creating a module per entity instead of per capability.
* Letting API routes construct or call repositories directly.
* Returning persistence records instead of domain objects.
* Placing business validation in filesystem or database adapters.
* Allowing one repository to persist several unrelated aggregates.
* Importing another module's domain or infrastructure internals.
* Re-exporting infrastructure from the module barrel.
