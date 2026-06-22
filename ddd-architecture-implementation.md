# DDD architecture and implementation decisions

This document is the consolidated implementation reference for Fabra's DDD
architecture under `src/backend/modules/`. It summarizes explicit architectural
decisions from existing docs, `AGENTS.md`, route/controller conventions, and the
rules currently encoded in verification scripts. It also records implicit
decisions that are visible in code but easy to miss during feature work.

## 1. Architectural intent

Fabra is migrating backend business behavior from legacy data helpers and API
controller logic into hexagonal DDD modules. The goal is not just folder
organization. The target architecture makes domain rules explicit, keeps HTTP,
database, AI providers, and frontend concerns at the edges, and gives every
business capability a testable use-case boundary.

The current canonical module root is:

```txt
src/backend/modules/
```

Some older docs still mention `src/modules/`. Treat that as historical wording.
New and migrated code lives under `src/backend/modules/`.

High-level decisions:

- Feature modules own business behavior.
- Domain code owns invariants.
- Application use cases orchestrate domain operations.
- Infrastructure adapts external systems to domain ports.
- API routes authenticate, validate, bind request infrastructure, call use cases,
  and serialize responses.
- Frontend code consumes API response contracts, not backend module internals.
- Cross-module reads go through the shared query bus or carefully scoped shared
  ports, not another module's repositories.
- Technical observability is handled through Sentry-backed telemetry and event
  infrastructure, not through legacy product event tables.

## 2. Module shape

The target module shape is:

```txt
src/backend/modules/<module-name>/
  domain/
    entities/
    value-objects/
    events/
    repositories/
    services/
    errors/
  application/
    use-cases/
    queries/
    presenters/
    services/
  infrastructure/
    repositories/
    services/
  <module-name>.module.ts
  index.ts
```

Layer responsibilities:

- `domain/`: aggregate roots, value objects, domain events, domain services,
  domain errors, and port interfaces. No HTTP, Supabase, SDK clients, telemetry
  implementations, application use cases, or infrastructure imports.
- `application/`: use cases, query handlers, presenters, and orchestration logic
  over domain ports. Application code may depend on domain and shared abstractions
  but not infrastructure implementations.
- `infrastructure/`: Supabase repositories, AI provider adapters, external
  services, and provider-aware factories. Infrastructure implements domain ports
  and maps external shapes into domain objects.
- `<module>.module.ts`: composition root for the module. It instantiates
  singleton repositories/factories/use cases and exposes `bindRequest`.
- `index.ts`: public module barrel. It exports public use-case/module factories,
  presenters, query classes/handlers, and public types. It must not re-export
  infrastructure or repository ports.

Canonical examples in the app:

- `src/backend/modules/work-journal/` is the smallest reference for the current
  module shape: aggregate roots, VOs, repository port, Supabase repository, use
  cases, AI service factories, module root, and barrel.
- `src/backend/modules/activity-context/` is a good reference for domain-heavy
  behavior with entities, many VOs, domain events, services, presenters, use
  cases, repository implementations, and tests.
- `src/backend/modules/job-match-analysis/` and
  `src/backend/modules/cv-analysis/` are useful references for modules that
  expose public queries through their barrels so other modules can read their
  data without importing internals.
- `src/backend/modules/shared/` is the only cross-module module intended to be
  imported broadly. It owns primitives such as `AggregateRoot`, `ValueObject`,
  `UserId`, `IsoDate`, `QueryBus`, event bus contracts, HTTP helpers, telemetry,
  and AI runtime guards.

## 3. Composition and runtime lifetime

Modules are singletons instantiated once from `src/lib/container.ts`.

Decisions:

- `src/lib/container.ts` is the app composition root.
- Module factories are called once at import time.
- Repositories are also singleton objects inside the module composition root.
- Supabase request state is not passed through constructors.
- Request-specific Supabase clients are injected via `module.bindRequest(supabase)`.
- `bindRequest` delegates to every Supabase-backed repository in that module.
- Route handlers must bind all modules they will use before calling use cases.

Infrastructure repositories usually extend
`BoundSupabaseRepository`, which stores the currently bound Supabase client and
throws if a repository is used before `bindRequest`.

Important implication: repository instances are long-lived, but the Supabase
client they use is rebound per request. This avoids rebuilding modules per
request while still allowing authenticated, request-scoped database access.

Canonical examples in the app:

- `src/backend/modules/work-journal/work-journal.module.ts` creates
  `SupabaseWorkJournalEntryRepository` once, wires all work-journal use cases
  once, and exposes `bindRequest(client)` that delegates to `entryRepo`.
- `src/lib/container.ts` creates `workJournalModule`,
  `activityContextsModule`, `jobMatchAnalysisModule`, `cvLibraryModule`, and
  the shared query/event buses once at module load.
- `src/backend/modules/shared/infrastructure/repositories/bound-supabase-repository.ts`
  is the canonical base class for repositories that receive their Supabase
  client via `bindRequest` and fail fast if used before binding.
- `src/lib/container.ts` also shows a cross-module binding nuance for
  `jobAnalysisChatModule`: its `bindRequest` is wrapped so dependent analysis
  modules are bound with the same request client before chat use cases run.

## 4. HTTP controller contract

Every route handler under `src/app/api/**` follows the same anatomy.

Required flow:

1. Start the handler body with `try`.
2. Call `getAuthenticatedRequestContext()` as the first real step for
   authenticated routes.
3. If authentication fails, return `authContext.response`.
4. Parse and validate route params, query params, or body using a route-local
   `validation.ts` parser.
5. Return `errorResponse(parsed.error)` for validation failures.
6. Bind each required module with `module.bindRequest(supabase)`.
7. Call one or more module use cases.
8. Serialize with response helpers such as `ok`, `created`, or `errorResponse`.
9. In `catch`, delegate to `handleApiError(error)`.

Controller decisions:

- Route handlers do not call `createClient()` directly.
- Route handlers do not call `supabase.auth.getUser()` manually.
- API-layer helpers are limited to HTTP concerns: auth, parsing, validation,
  response mapping, and thin route adapters.
- Business workflow helpers do not belong under `src/app/api/**`.
- Controllers may orchestrate multiple use cases when the HTTP flow requires it,
  but business decisions and side effects should live in module use cases.
- New frontend-consumed routes should expose response contracts in colocated
  `responses.ts` files.
- Frontend code must import response types from `responses.ts`, never from
  `route.ts`.

Implementation nuance found in current code: some existing routes still import
`handleApiError` from `@/app/api/_shared/api-error-handler` while the architectural
target says to use the shared backend helper. Treat the route anatomy as the
target and avoid spreading older patterns.

Canonical examples in the app:

- `src/app/api/work-journal/entries/[id]/route.ts` shows the route shape for
  authenticated update/delete flows: get auth context, parse params/body,
  validate, bind `workJournalModule` and `activityContextsModule`, execute use
  cases, and serialize through `ok(...)`.
- `src/app/api/reviews/route.ts` is a compact create/list reference for a
  migrated module route using `performanceReviewModule.bindRequest(supabase)`,
  route-local validation, and response helpers.
- `src/app/api/work-journal/entries/[id]/responses.ts` is a small example of
  keeping serialized route response contracts out of `route.ts`.
- `src/app/api/work-journal/entries/[id]/validation.ts` is the corresponding
  route-local parser example. Validation there is about HTTP payload shape; the
  domain still validates invariants through VOs and entities.

## 5. Domain model decisions

### 5.1 Aggregate roots

Domain entities are aggregate roots. They extend `AggregateRoot`.

Required shape:

- `export interface <Entity>Primitives`
- `export interface <Entity>CreateParams` when `create(...)` does not receive
  primitives directly
- private or protected constructor
- `static create(params)`
- `static fromPrimitives(primitives: <Entity>Primitives)`
- `toPrimitives(): <Entity>Primitives`
- domain methods that mutate aggregate state and record domain events when
  behavior has occurred

Key decision: aggregate constructors receive value objects, not primitives.
`fromPrimitives` is the boundary that hydrates value objects. `toPrimitives` is
the boundary that serializes them back.

Aggregate fields should be backed by value objects. The entity verification
script checks that every `toPrimitives()` field delegates to an inner
`.toPrimitives()` call.

Aggregate create/update input distinction:

- `*Primitives` is boundary data for hydration/serialization.
- `*CreateParams` and domain method params use value objects.
- Do not pass raw primitives into constructors or domain methods.

Canonical examples in the app:

- `src/backend/modules/work-journal/domain/entities/journal-entry.entity.ts`
  shows the full aggregate shape: `WorkJournalEntryPrimitives`,
  `WorkJournalEntryCreateParams`, private constructor, `create`,
  `fromPrimitives`, domain methods, recorded events, and `toPrimitives`.
- `WorkJournalEntry.create(...)` receives VOs such as `WorkJournalEntryId`,
  `UserId`, `IsoDate`, `OptionalIsoDate`, `WorkJournalTopic`,
  `WorkJournalNotes`, and `Timestamp`. It does not receive raw strings from the
  API.
- `WorkJournalEntry.fromPrimitives(...)` is the only hydration boundary for
  raw entry data. It immediately turns strings and nullable strings into VOs.
- `WorkJournalEntry.toPrimitives()` is canonical for aggregate serialization:
  every returned field is produced through an inner VO's `toPrimitives()`.

### 5.2 Value objects

Value objects are the main enforcement point for invariants.

Required shape:

- one VO per `*.value-object.ts` file
- exported class extending `ValueObject` or a shared VO base such as `EntityId`,
  `IsoDate`, `OptionalIsoDate`, `Timestamp`, or `UserId`
- private or protected constructor, unless inherited from an allowed shared base
- `static fromPrimitives(...)`
- `toPrimitives()`
- no mutator-like instance methods
- no public mutable properties

Simple VOs wrap one primitive and validate it.

Composite VOs compose other value objects. They do not store raw primitives or a
`*Primitives` blob internally. Each attribute of a composite VO should itself be
a VO. `toPrimitives()` must rebuild the primitive shape by calling
`toPrimitives()` on inner VOs.

Boundary primitive interfaces:

- `*Primitives` interfaces use plain primitives only.
- Do not use `Date`, VO classes, domain union aliases, or domain object types in
  `*Primitives`.
- Literal unions are allowed as primitive-like types, but the general rule is to
  expose broad primitives at the boundary and narrow inside `fromPrimitives`.

Enum-like VO decision:

- If a VO file defines enum-like constants, the script expects semantic static
  constructors for each key, such as `static integrated()`.
- It also expects boolean checker methods such as `isIntegrated()`.

Canonical examples in the app:

- `src/backend/modules/activity-context/domain/value-objects/activity-context-suggestion.value-object.ts`
  is the canonical composite VO pattern. It stores
  `ActivityContextSuggestionType`, `ActivityContextSuggestionName`,
  `ActivityContextRoleOrLabel`, `ActivityContextIsCurrent`, and
  `ActivityContextSuggestionSource`; it does not store a primitive object blob.
- `src/backend/modules/work-journal/domain/value-objects/work-journal-topic.value-object.ts`
  is a simple nullable text VO reference.
- `src/backend/modules/shared/domain/value-objects/user-id.value-object.ts`,
  `iso-date.value-object.ts`, `optional-iso-date.value-object.ts`, and
  `timestamp.value-object.ts` are the canonical shared VOs to reuse instead of
  redefining IDs or dates in feature modules.
- `src/backend/modules/shared/domain/value-objects/ai-provider.value-object.ts`
  is the shared provider VO used at the AI boundary. It delegates provider
  parsing to shared provider rules and serializes back to the provider string.

### 5.3 Domain events

Aggregates may record domain events internally with `recordDomainEvent`.

Current decisions:

- Domain events represent business occurrences, not Sentry telemetry.
- Aggregate methods record events when state changes.
- Use cases can pull or publish those events later.
- The shared event bus exists, but domain events should stay domain-level and not
  become a replacement for technical observability.

Canonical examples in the app:

- `src/backend/modules/work-journal/domain/entities/journal-entry.entity.ts`
  records `WorkJournalEntryCreatedEvent`, `WorkJournalEntryUpdatedEvent`, and
  `WorkJournalEntryDeletedEvent` from aggregate behavior.
- `src/backend/modules/work-journal/application/use-cases/create-entry.use-case.ts`
  creates the aggregate, saves it, pulls domain events with
  `entry.pullDomainEvents()`, and publishes them through the injected
  `EventBus`.
- `src/backend/modules/activity-context/domain/events/` is a good reference for
  event naming around aggregate lifecycle operations: created, updated,
  archived, restored, and deleted.

## 6. Repository contracts

Repository interfaces live under `domain/repositories/` and are module-internal.

Canonical aggregate repository methods:

```ts
search(criteria): Promise<Aggregate[]>
findById(id: IdVO, userId: UserId): Promise<Aggregate | null>
save(aggregate: Aggregate): Promise<Aggregate>
delete(id: IdVO, userId: UserId): Promise<void>
```

Critical micro-decisions:

- Repository ports return entities or value objects, not primitives.
- Repository ports accept entities or value objects, not primitives.
- Repository ports must not accept or return `*Primitives`.
- Repository ports must not accept or return `Create*Input` or `Update*Input`
  shapes.
- Repository ports must not expose inline object persistence blobs.
- Repository ports must not use `Date`.
- Aggregate repositories should use `save(entity)` instead of separate
  `create(...)` and `update(...)` methods.
- Search criteria objects may exist, but their fields should be value objects or
  nullable value objects, not raw strings.

Infrastructure repository implementations may contain legacy-compatible helper
methods or input types while migration is in progress, but the domain repository
interface is the contract that matters for new use cases.

Infrastructure mapping decisions:

- Database rows are `snake_case`.
- Domain primitives are `camelCase`.
- Mapping from rows to primitives lives in infrastructure.
- Hydration uses `Aggregate.fromPrimitives(rowToPrimitives(row))`.
- Persistence uses `aggregate.toPrimitives()` followed by row mapping.
- Supabase errors are thrown from infrastructure and normalized at the API error
  boundary.

Canonical examples in the app:

- `src/backend/modules/work-journal/domain/repositories/work-journal-entry.repository.ts`
  is the canonical aggregate repository port. It exposes `search`, `findById`,
  `save`, and `delete`, and all parameters/returns are VOs or
  `WorkJournalEntry`.
- `WorkJournalEntrySearchCriteria` in that same file is the canonical search
  criteria pattern: `userId`, `contextId`, `search`, `topic`, `dateFrom`, and
  `dateTo` are VOs or nullable VOs.
- `src/backend/modules/work-journal/infrastructure/repositories/supabase-work-journal-entry.repository.ts`
  shows the infrastructure mapping pattern: `WorkJournalEntryRow` is
  `snake_case`, `rowToPrimitives(...)` maps into camelCase primitives, and
  `rowToEntry(...)` hydrates the aggregate with
  `WorkJournalEntry.fromPrimitives(...)`.
- That same Supabase repository still contains legacy-compatible helper methods
  such as `list`, `getById`, `create`, and `update`. They are acceptable only as
  migration adapters; the domain port remains the canonical contract.

## 7. Use cases

Use cases live under `application/use-cases/` and receive dependencies through
constructors.

Decisions:

- Use cases depend on domain ports, shared buses, and domain/application
  services.
- Use cases do not instantiate repositories, Supabase clients, SDK clients, or
  provider-specific AI services.
- Use cases should return domain entities, value objects, or explicit read-model
  value objects from the application/domain boundary.
- Use cases should not return database rows or persistence input shapes.
- Use cases are the place for application orchestration: loading aggregates,
  calling domain methods, saving through repositories, publishing events, and
  coordinating query bus reads.
- Validation of HTTP payload syntax stays in route `validation.ts`; validation
  of domain invariants stays in value objects/entities.

Testing decision: every `*.use-case.ts` must have a colocated
`*.use-case.test.ts`.

Canonical examples in the app:

- `src/backend/modules/work-journal/application/use-cases/create-entry.use-case.ts`
  is the basic command pattern: convert HTTP-shaped input into VOs, create an
  aggregate, save through the repository port, publish domain events, and return
  the saved aggregate.
- `src/backend/modules/work-journal/application/use-cases/update-entry.use-case.ts`
  is the update pattern: load by VO identifiers, throw a domain/not-found error
  when missing, call an aggregate method with VOs, save, publish events, and
  return the aggregate.
- `src/backend/modules/performance-review/application/use-cases/generate-self-assessment.use-case.ts`
  is a richer orchestration reference for an AI-backed use case that depends on
  injected ports/factories rather than constructing provider SDK clients itself.
- `src/backend/modules/cv-library/application/use-cases/prepare-cv-analysis-input.use-case.ts`
  is a useful reference for application logic that prepares a read/workflow
  result without pushing that workflow into an API helper.

## 9. Cross-module boundaries and CQRS

Feature modules must not import another feature module's internal paths.

Allowed cross-module patterns:

- import public query classes/types from another module's barrel
- dispatch through `QueryBus`
- use minimal shared port interfaces when unavoidable
- compose multiple module use cases at the API controller boundary when the HTTP
  workflow genuinely spans modules

Query decisions:

- Queries are side-effect free.
- Queries do not persist data.
- Queries do not upload/delete files.
- Queries do not retry extraction.
- Queries do not execute commands.
- Query handlers live in the data-owning module.
- Query handlers delegate to the matching use case and should not contain
  separate business logic.
- Query and handler names mirror the use case they execute.
- Query handlers must have colocated tests.
- Unregistered queries should fail clearly.

When a workflow needs to read state and then perform a mutation, model it as an
explicit command/use case or orchestrate it in the API controller. Do not hide
that behavior inside a query.

Canonical examples in the app:

- `src/backend/modules/job-match-analysis/application/queries/get-job-match-analysis-by-id.query.ts`
  defines the public query payload and query name for a cross-module read.
- `src/backend/modules/job-match-analysis/application/queries/get-job-match-analysis-by-id.query-handler.ts`
  delegates to `GetJobMatchAnalysisByIdUseCase` and presents the result instead
  of implementing separate business logic.
- `src/lib/container.ts` registers query handlers such as
  `GetJobMatchAnalysisByIdQueryHandler`, `ListJobMatchAnalysesQueryHandler`,
  `ListJournalEntriesInRangeQueryHandler`, and
  `ListCommitmentsInRangeQueryHandler` against the shared `queryBus`.
- `src/backend/modules/performance-review/performance-review.module.ts` is a
  good reference for a module that receives `QueryBus` in its module factory so
  its use cases can read evidence from other modules without importing their
  repositories.

## 11. Frontend boundary decisions

Frontend feature code lives under:

```txt
src/frontend/features/<feature-name>/
```

Decisions:

- New substantial frontend work belongs in route-driven feature folders.
- Feature internals are private by default.
- Other code imports a feature only through its `index.ts` barrel.
- Do not deep-import another feature.
- Shared frontend code is extracted only after real reuse or a dependency
  direction problem exists.
- User-visible React strings use `next-intl` translations via `useTranslations`.
- Components and hooks do not import from `@/backend/modules/**`.
- Frontend API clients may import API response types from route `responses.ts`
  using `import type`.

When a screen becomes large, split substantial regions into sibling components
inside the feature. Do not leave complex views as monolithic components, and do
not use JSX section comments as a substitute for component extraction.

Canonical examples in the app:

- `src/frontend/features/job-match-analysis/` is the reference for a larger
  route-driven feature with feature-local API clients, hooks, components, and
  region subfolders.
- `src/frontend/features/job-match-analysis/components/` shows the intended
  large-feature organization: root orchestration components plus functional
  regions such as `list`, `kanban`, `new-flow`, `extraction`, `detail`, and
  `copy-paste`.
- `src/frontend/features/activity-context/` and
  `src/frontend/features/work-journal/` are useful references for smaller
  feature folders where components can stay flatter until the feature naturally
  grows.
- `src/frontend/i18n/messages.ts` is the canonical place for `en` and `es`
  strings consumed by `useTranslations(...)`.

## 12. Testing and verification

Backend DDD testing decisions:

- Domain entities have colocated tests.
- Value objects have colocated tests.
- Domain services with logic have colocated tests.
- Use cases have colocated tests.
- Infrastructure repositories have colocated tests.
- Query handlers have colocated tests.
- Shared query/event bus files have colocated tests.
- Database tests use the real Supabase E2E stack.
- Do not mock database interactions.
- Do not test real AI service implementations directly.
- Inject mocks into use cases when AI behavior is needed.

Required command for DDD changes:

```sh
npm run ddd:check
```

`npm run ddd:check` is backed by scripts that verify:

- required colocated tests
- import direction between DDD layers
- aggregate/entity structure
- value object structure and primitive boundaries
- route/frontend/lib import boundaries
- module barrel exports

Canonical examples in the app:

- `src/backend/modules/work-journal/domain/entities/journal-entry.entity.test.ts`
  is a colocated aggregate test reference.
- `src/backend/modules/activity-context/domain/value-objects/activity-context-suggestion.value-object.test.ts`
  is a colocated composite VO test reference.
- `src/backend/modules/work-journal/application/use-cases/create-entry.use-case.test.ts`
  is a colocated use-case test reference.
- `src/backend/modules/work-journal/infrastructure/repositories/supabase-work-journal-entry.repository.test.ts`
  is a real-Supabase repository test reference.
- `src/backend/modules/job-match-analysis/application/queries/get-job-match-analysis-by-id.query-handler.test.ts`
  is a colocated query-handler test reference.

## 13. Import and export boundaries enforced by scripts

DDD import direction:

- domain must not import application
- domain must not import infrastructure
- application must not import infrastructure
- infrastructure must not import application
- feature modules must not import another feature module's internals
- `shared` is exempt where appropriate

Route/frontend/lib import rules:

- Files under `src/app/`, `src/frontend/components/`, and `src/lib/` must not
  import internal module paths such as
  `@/backend/modules/<module>/infrastructure/...`.
- They may import module barrels such as `@/backend/modules/<module>`.
- `@/backend/modules/shared` is exempt.
- API routes should not import relatively across unrelated route families, except
  `_shared` route helpers.
- Certain `src/lib/` re-export shims intentionally import domain files directly
  to avoid client builds pulling in server-only code through module barrels.

Barrel export rules:

- Module `index.ts` files must not re-export `infrastructure/`.
- Module `index.ts` files must not re-export `domain/repositories/`.
- Repository ports are module-internal; consumers use use cases, presenters,
  queries, or public value/entity types as needed.

Known enforcement nuance:

- `scripts/verify-ddd-imports.mjs` currently filters files under
  `src/backend/modules/` but its `parseModulePath` function still checks for
  `src/modules`. This weakens some layer-boundary detection. The intended rule
  is still the DDD import direction above, and the script should be corrected
  before relying on it as complete enforcement.

Canonical examples in the app:

- `src/backend/modules/work-journal/index.ts` is a module barrel reference: it
  exports public module/use-case/query/presenter surface but not Supabase
  repositories or repository port interfaces.
- `src/lib/cv-profile.ts` and `src/lib/cv-templates.ts` are intentional
  re-export shims that import domain files directly to avoid pulling server-only
  module barrels into client bundles.
- `scripts/verify-ddd-barrel-exports.mjs` is the source of truth for forbidden
  module barrel re-exports.
- `scripts/verify-ddd-route-imports.mjs` is the source of truth for route,
  frontend component, and `src/lib` imports from backend modules.

## 14. Persistence and naming boundaries

Naming decisions:

- Domain, use-case inputs, presenters, and new API contracts use camelCase.
- Database rows use snake_case.
- Legacy HTTP payloads may still use snake_case at the boundary.
- Infrastructure repositories are responsible for conversion.

Date/time decisions:

- Domain uses shared date/time value objects such as `IsoDate`,
  `OptionalIsoDate`, `Timestamp`, and `OptionalTimestamp`.
- Repository ports do not expose `Date`.
- Database row types expose serialized date strings.

Identity decisions:

- IDs are value objects.
- Shared generic IDs use `EntityId` or module-specific subclasses.
- `UserId` is shared and should be reused instead of redefining user-id VOs per
  module.

Canonical examples in the app:

- `src/backend/modules/work-journal/infrastructure/repositories/supabase-work-journal-entry.repository.ts`
  has the canonical `snake_case` row to camelCase primitives mapping:
  `user_id` becomes `userId`, `activity_context_id` becomes `contextId`,
  `date_start` becomes `dateStart`, and so on.
- `src/backend/modules/work-journal/domain/entities/journal-entry.entity.ts`
  uses shared `UserId`, `IsoDate`, `OptionalIsoDate`, and `Timestamp`, plus
  module-specific IDs such as `WorkJournalEntryId` and
  `WorkJournalContextId`.
- `src/backend/modules/shared/domain/value-objects/entity-id.value-object.ts`
  is the generic ID base for module-specific ID value objects.
- `src/backend/modules/shared/domain/value-objects/optional-timestamp.value-object.ts`
  is the nullable timestamp reference when persistence can legitimately contain
  no timestamp.

## 16. Practical decision checklist

Use this checklist when touching backend DDD code:

- Is the business rule in a VO, entity, domain service, or use case instead of an
  API helper?
- Does the use case depend on ports rather than infrastructure?
- Does every repository port accept/return entities or VOs only?
- Does every aggregate field serialize through an inner VO?
- Are `*Primitives` interfaces plain primitive boundary shapes?
- Are row-to-domain and domain-to-row mappings isolated in infrastructure?
- Did the route validate before executing use cases?
- Did the route bind every module it calls?
- Are cross-module reads using the query bus or a public module API?
- Is any query side-effect free?
- Are AI prompts separated from model-call controllers?
- Is AI provider/model/apiKey passed through provider-aware factories?
- Are response contracts frontend-import-safe?
- Are frontend imports kept away from backend internals?
- Are colocated tests present for the touched DDD source files?
- Does `npm run ddd:check` pass?

## 17. Reusable architecture assets to copy into another app

This section is an index of reusable building blocks that another application can
copy from Fabra when adopting this architecture. Some files can be copied almost
as-is; others are examples that should be adapted to the target app's framework,
database client, environment variables, telemetry provider, and module names.

### 17.1 Core domain primitives

Copy these first. They are the smallest domain foundation for the whole DDD
style.

- `src/backend/modules/shared/domain/entities/aggregate-root.ts`: base entity
  with domain-event recording and pulling.
- `src/backend/modules/shared/domain/value-objects/value-object.ts`: generic
  base class for all value objects.
- `src/backend/modules/shared/domain/errors/domain-error.ts`: shared domain
  error type.
- `src/backend/modules/shared/domain/errors/invalid-api-key.error.ts`: example
  of a specific shared domain error.
- `src/backend/modules/shared/domain/value-objects/entity-id.value-object.ts`:
  reusable ID base for module-specific IDs.
- `src/backend/modules/shared/domain/value-objects/user-id.value-object.ts`:
  shared user identity VO.
- `src/backend/modules/shared/domain/value-objects/iso-date.value-object.ts`:
  date-only VO.
- `src/backend/modules/shared/domain/value-objects/optional-iso-date.value-object.ts`:
  nullable date-only VO.
- `src/backend/modules/shared/domain/value-objects/timestamp.value-object.ts`:
  timestamp VO.
- `src/backend/modules/shared/domain/value-objects/optional-timestamp.value-object.ts`:
  nullable timestamp VO.
- `src/backend/modules/shared/domain/value-objects/boolean-flag.value-object.ts`:
  generic boolean VO.
- `src/backend/modules/shared/domain/value-objects/counter.value-object.ts`:
  generic numeric counter VO.
- `src/backend/modules/shared/domain/value-objects/long-text.value-object.ts`:
  reusable long text VO.
- `src/backend/modules/shared/domain/value-objects/string-list.value-object.ts`:
  reusable string-list VO.
- `src/backend/modules/shared/domain/value-objects/execution-result.value-object.ts`:
  generic execution-result VO.

Also copy the colocated tests beside these files. They are useful examples for
the expected test style and help validate that the primitives still behave after
renaming imports in the target app.

### 17.2 Event bus

These files provide the domain/infrastructure event-bus baseline.

- `src/backend/modules/shared/domain/bus/event-bus/domain-event.ts`: domain event
  contract.
- `src/backend/modules/shared/domain/bus/event-bus/infrastructure-event.ts`:
  infrastructure/technical event contract.
- `src/backend/modules/shared/domain/bus/event-bus/event-bus.ts`: event bus port.
- `src/backend/modules/shared/infrastructure/bus/event-bus/in-memory-event-bus.ts`:
  in-memory event bus implementation used by the container.

Canonical usage examples:

- `src/backend/modules/work-journal/domain/entities/journal-entry.entity.ts`
  records events from aggregate behavior.
- `src/backend/modules/work-journal/application/use-cases/create-entry.use-case.ts`
  pulls and publishes aggregate events after persistence.
- `src/lib/container.ts` instantiates `InMemoryEventBus`.

### 17.3 Query bus

These files provide the cross-module read boundary.

- `src/backend/modules/shared/domain/bus/query-bus/query.ts`: query contract.
- `src/backend/modules/shared/domain/bus/query-bus/query-handler.ts`: query
  handler contract.
- `src/backend/modules/shared/domain/bus/query-bus/query-bus.ts`: query bus port.
- `src/backend/modules/shared/domain/bus/query-bus/unregistered-query-handler.error.ts`:
  explicit failure for missing handlers.
- `src/backend/modules/shared/infrastructure/bus/query-bus/in-memory-query-bus.ts`:
  in-memory query bus implementation used by the container.
- `scripts/verify-query-bus.mjs`: guardrail for query-bus conventions.

Canonical usage examples:

- `src/backend/modules/job-match-analysis/application/queries/get-job-match-analysis-by-id.query.ts`
  defines a public cross-module query.
- `src/backend/modules/job-match-analysis/application/queries/get-job-match-analysis-by-id.query-handler.ts`
  delegates to the owning use case and presenter.
- `src/lib/container.ts` registers query handlers on `queryBus`.
- `src/backend/modules/performance-review/performance-review.module.ts` receives
  `QueryBus` through module composition.

### 17.4 Supabase request binding and repositories

Copy or adapt these if the target app uses Supabase or another request-scoped
database client.

- `src/backend/modules/shared/infrastructure/supabase-aware.ts`: shared
  interface for objects that can bind a request Supabase client.
- `src/backend/modules/shared/infrastructure/repositories/bound-supabase-repository.ts`:
  base class for singleton repositories with request-bound Supabase access.
- `src/backend/modules/work-journal/infrastructure/repositories/supabase-work-journal-entry.repository.ts`:
  canonical row-to-domain and domain-to-row mapping example.
- `src/backend/modules/work-journal/domain/repositories/work-journal-entry.repository.ts`:
  canonical aggregate repository port.

If the target app does not use Supabase, keep the port shape and the module
`bindRequest` idea, but replace the infrastructure base class with the target
database client's request/session binding mechanism.

### 17.5 Module composition and container

These are the main examples to copy when building module factories and the app
composition root.

- `src/backend/modules/work-journal/work-journal.module.ts`: compact module
  factory with singleton repositories, provider-aware AI factory, use-case
  creation, instrumentation, and `bindRequest`.
- `src/backend/modules/activity-context/activity-contexts.module.ts`: reference
  for a domain-heavy module with several use cases and repositories.
- `src/backend/modules/performance-review/performance-review.module.ts`: module
  factory that receives `QueryBus`.
- `src/backend/modules/job-analysis-chat/job-analysis-chat.module.ts`: module
  with chat-specific services and cross-module read dependencies.
- `src/lib/container.ts`: application composition root. It creates shared buses,
  telemetry, modules, query-handler registrations, and module-level binding
  adaptations.

When copying `src/lib/container.ts`, expect to rewrite imports and module names.
The reusable decision is the pattern: instantiate singleton modules once,
register query handlers once, inject shared buses/telemetry at composition time,
and bind Supabase per request from API routes.

### 17.6 HTTP API helpers and route anatomy

These files define the route-handler boundary.

- `src/app/api/_shared/auth/request-context.ts`: authenticated request context
  helper that returns `{ ok, supabase, user }` or a serialized auth failure.
- `src/app/api/_shared/api-error-handler.ts`: current app-level API error
  handler used by many routes.
- `src/backend/modules/shared/infrastructure/http/api-errors.ts`: backend shared
  HTTP error helpers and response helpers.
- `src/backend/modules/shared/infrastructure/http/create-api-error-handler.ts`:
  factory for consistent API error handling.
- `src/backend/modules/shared/infrastructure/http/domain-error-handler.ts`:
  legacy domain-error handler reference. Prefer the newer `handleApiError`
  pattern when building a new app.
- `src/app/api/_shared/ai-request.ts`: helper for AI request parsing.

Canonical route examples:

- `src/app/api/work-journal/entries/[id]/route.ts`: authenticated route with
  validation, multi-module binding, use-case execution, and response contract.
- `src/app/api/work-journal/entries/[id]/validation.ts`: route-local validation.
- `src/app/api/work-journal/entries/[id]/responses.ts`: route-local response
  contract.
- `src/app/api/reviews/route.ts`: compact list/create route for a migrated
  module.

### 17.9 Shared barrel exports

Copy this after copying the shared files, then adjust exports to match the target
app.

- `src/backend/modules/shared/index.ts`: public shared-module barrel.

The barrel is important because most modules import shared primitives from
`@/backend/modules/shared` instead of deep-importing every shared file. In a new
app, keep the barrel small enough to be understandable and avoid exporting
provider/client-specific internals that should stay infrastructure-only.

### 17.10 Verification scripts and guardrails

These scripts are highly reusable. Copy them together, then update path aliases,
module roots, allowlists, and package scripts for the target app.

- `scripts/verify-ddd.mjs`: aggregate DDD verification entrypoint.
- `scripts/verify-ddd-tests.mjs`: colocated test enforcement.
- `scripts/verify-ddd-imports.mjs`: DDD import-direction enforcement.
- `scripts/verify-ddd-entities.mjs`: aggregate/entity structure enforcement.
- `scripts/verify-ddd-value-objects.mjs`: VO structure and primitive-boundary
  enforcement.
- `scripts/verify-ddd-route-imports.mjs`: route/frontend/lib import boundary
  enforcement.
- `scripts/verify-ddd-barrel-exports.mjs`: module barrel export enforcement.
- `scripts/verify-ddd-repository-return-types.mjs`: repository return-type
  guardrail.
- `scripts/verify-ddd-use-cases-return-types.mjs`: use-case return-type
  guardrail.
- `scripts/verify-ddd-services.mjs`: DDD service conventions.
- `scripts/verify-ddd-supabase-repository-tables.mjs`: Supabase repository table
  guardrail.
- `scripts/verify-api-controllers.mjs`: API controller anatomy guardrail.
- `scripts/verify-ai-service-di.mjs`: AI provider-aware DI guardrail.
- `scripts/verify-frontend-api-response-contracts.mjs`: frontend/API response
  contract guardrail.
- `scripts/verify-frontend-boundaries.mjs`: frontend feature boundary guardrail.
- `scripts/verify-frontend-components.mjs`: frontend component-structure
  guardrail.
- `scripts/verify-technical-observability-boundaries.mjs`: observability
  boundary guardrail.

Important copy note: `scripts/verify-ddd-imports.mjs` currently contains a
historical `src/modules` parser nuance documented above. Fix that while copying
it into a new app, or update it here first before using it as a strict template.

### 17.11 Architecture and process docs to copy

These docs explain the decisions behind the reusable files.

- `docs/architecture/ddd-architecture-implementation.md`: this document.
- `docs/architecture/value-objects.md`: detailed VO implementation rules.
- `docs/architecture/ddd-module-map.md`: module boundary and migration map.
- `docs/architecture/ai-service-dependency-injection.md`: provider-aware AI DI
  pattern.
- `docs/architecture/frontend-feature-architecture.md`: frontend feature-folder
  architecture.
- `docs/architecture/ui-internationalization-guide.md`: i18n conventions.
- `docs/architecture/ai-interaction-events.md`: AI interaction event design.

When using Fabra as a base for another application, copy the docs with the code
and keep them close to the scripts. The scripts enforce the rules, but the docs
explain why the rules exist and how to evolve them intentionally.
