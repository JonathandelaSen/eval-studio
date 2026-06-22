# Eval Studio MVP

Eval Studio is a separate local web application for reviewing, scoring, comparing, and eventually running evaluations for AI-backed product actions.

The first consumer is Fabra, but the app must not be coupled to Fabra internals. It reads and writes a shared file-based evaluation workspace.

## Product Intent

AI-backed product behavior should be evaluated as repeatable experiments, not by ad hoc manual impressions.

Eval Studio should make it easy to answer:

- What cases do I have for this AI action?
- What happened when I ran this prompt/model/config?
- Which outputs are better or worse?
- Did a prompt change improve or regress behavior?
- What did the model actually receive?

## Core Decisions

- Eval Studio is a separate project/repository from Fabra.
- Eval Studio is a local web app.
- Eval Studio uses `.env.local` for providers, API keys, endpoints, and workspace path.
- Eval Studio reads evaluation artifacts from a folder such as `/Users/jon/DEV/repos/fabra/evals`.
- Fabra can produce cases and baseline results.
- Eval Studio can produce additional runs/results.
- The primary evaluation unit is an AI-backed product action, not a prompt file alone.
- Cases store prompt templates, prompt variables, and rendered prompts when available.
- Human scoring uses one score from `0` to `5`.
- Human annotations can include a comment and tags.
- There is no `pass/fail/needs_review` verdict in the MVP.
- Prompt content must be easily accessible in the result review UI.

## Workspace Configuration

Example `.env.local`:

```txt
EVAL_STUDIO_WORKSPACE=/Users/jon/DEV/repos/fabra/evals

OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1

OLLAMA_BASE_URL=http://localhost:11434

MOCK_PROVIDER_ENABLED=true
```

Eval Studio should fail clearly if `EVAL_STUDIO_WORKSPACE` is missing or unreadable.

## Artifact Workspace

Expected folder:

```txt
evals/
  manifest.json
  suites/
  runs/
  annotations/
```

Suggested concrete layout:

```txt
evals/
  manifest.json
  suites/
    job_match_analysis.score_cv_against_offer/
      suite.json
      cases/
        senior-backend-missing-node.case.json
  runs/
    2026-06-22T100000Z.fabra-baseline/
      run.json
      results/
        senior-backend-missing-node.result.json
    2026-06-22T111500Z.openai-gpt-4.1-prompt-v2/
      run.json
      results/
        senior-backend-missing-node.result.json
  annotations/
    2026-06-22T111500Z.openai-gpt-4.1-prompt-v2/
      senior-backend-missing-node.annotation.json
```

All MVP artifacts are plain JSON files.

## Manifest

`manifest.json` describes the workspace.

```json
{
  "schemaVersion": "1",
  "workspaceName": "Fabra evals",
  "createdAt": "2026-06-22T10:00:00.000Z"
}
```

## Suite

A suite groups cases for one product action.

```json
{
  "schemaVersion": "1",
  "suiteId": "job_match_analysis.score_cv_against_offer",
  "actionId": "job_match_analysis.score_cv_against_offer",
  "name": "Job match scoring",
  "description": "Cases for scoring a CV against a job description.",
  "caseIds": [
    "job-match-analysis.score_cv_against_offer.senior-backend-node"
  ]
}
```

## Case

A case is a reproducible situation for an AI-backed product action.

Cases should be self-contained enough for Eval Studio to inspect and execute without starting Fabra.

```json
{
  "schemaVersion": "1",
  "caseId": "job-match-analysis.score_cv_against_offer.senior-backend-node",
  "actionId": "job_match_analysis.score_cv_against_offer",
  "name": "Senior backend with missing Node requirement",
  "note": "The result should strongly penalize the missing Node.js requirement.",
  "createdAt": "2026-06-22T10:00:00.000Z",
  "createdBy": {
    "source": "fabra",
    "userRole": "admin"
  },
  "input": {
    "cvText": "...",
    "jobDescription": "...",
    "jobUrl": "https://example.com/job",
    "language": "es"
  },
  "promptTemplate": {
    "format": "messages",
    "templateId": "job_match_analysis.score_cv_against_offer.v1",
    "messages": [
      {
        "role": "system",
        "content": "You are evaluating a CV against a job description. Respond in {{language}}."
      },
      {
        "role": "user",
        "content": "CV:\n{{cvText}}\n\nJob description:\n{{jobDescription}}"
      }
    ]
  },
  "promptVariables": {
    "language": "es",
    "cvText": "...",
    "jobDescription": "..."
  },
  "renderedPrompt": {
    "format": "messages",
    "messages": [
      {
        "role": "system",
        "content": "You are evaluating a CV against a job description. Respond in es."
      },
      {
        "role": "user",
        "content": "CV:\n...\n\nJob description:\n..."
      }
    ]
  },
  "runtime": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "temperature": 0.2
  },
  "expectedOutput": {
    "kind": "json",
    "schemaRef": "fabra://job_match_analysis/score_response/v1"
  },
  "source": {
    "app": "fabra",
    "route": "/job-match-analyses/...",
    "entityRefs": {
      "analysisId": "..."
    }
  }
}
```

For MVP execution, Eval Studio can use `renderedPrompt` directly. It should also preserve `promptTemplate` and `promptVariables` so future workflows can change variable values, re-render the prompt, and compare the effect without manually reverse-engineering the rendered text.

## Run

A run is one experiment over one or more cases.

```json
{
  "schemaVersion": "1",
  "runId": "2026-06-22T111500Z.openai-gpt-4.1-prompt-v2",
  "name": "OpenAI GPT-4.1 prompt v2",
  "actionId": "job_match_analysis.score_cv_against_offer",
  "producer": "eval-studio",
  "createdAt": "2026-06-22T11:15:00.000Z",
  "caseIds": [
    "job-match-analysis.score_cv_against_offer.senior-backend-node"
  ],
  "runtime": {
    "provider": "openai",
    "model": "gpt-4.1",
    "temperature": 0.2
  },
  "executionMode": "prompt_replay",
  "notes": "Replay captured Fabra prompts with OpenAI."
}
```

`producer` can be `fabra`, `eval-studio`, or another app later.

## Result

A result is the output for one case inside one run.

Every result must persist the exact `renderedPrompt` that was executed. If Eval Studio runs with edited variables, the result should also persist the effective `promptVariables` used for that execution so the run remains auditable.

```json
{
  "schemaVersion": "1",
  "resultId": "2026-06-22T111505Z.openai-gpt-4.1.senior-backend-node",
  "caseId": "job-match-analysis.score_cv_against_offer.senior-backend-node",
  "runId": "2026-06-22T111500Z.openai-gpt-4.1-prompt-v2",
  "producer": "eval-studio",
  "createdAt": "2026-06-22T11:15:05.000Z",
  "runtime": {
    "provider": "openai",
    "model": "gpt-4.1",
    "temperature": 0.2
  },
  "promptVariables": {
    "language": "es",
    "cvText": "...",
    "jobDescription": "..."
  },
  "renderedPrompt": {
    "format": "messages",
    "messages": [
      {
        "role": "system",
        "content": "..."
      },
      {
        "role": "user",
        "content": "..."
      }
    ]
  },
  "rawOutput": "...",
  "parsedOutput": {
    "score": 76
  },
  "status": "completed",
  "error": null,
  "usage": {
    "inputTokens": 1200,
    "outputTokens": 400,
    "costUsd": null
  },
  "latencyMs": 3200
}
```

If execution fails:

```json
{
  "schemaVersion": "1",
  "resultId": "...",
  "caseId": "...",
  "runId": "...",
  "producer": "eval-studio",
  "createdAt": "2026-06-22T11:15:05.000Z",
  "runtime": {
    "provider": "openai",
    "model": "gpt-4.1"
  },
  "renderedPrompt": {
    "format": "messages",
    "messages": []
  },
  "rawOutput": null,
  "parsedOutput": null,
  "status": "failed",
  "error": {
    "message": "Provider request failed.",
    "code": "provider_error"
  },
  "usage": null,
  "latencyMs": 800
}
```

## Annotation

Annotations are editable human judgments for a result.

```json
{
  "schemaVersion": "1",
  "resultId": "2026-06-22T111505Z.openai-gpt-4.1.senior-backend-node",
  "caseId": "job-match-analysis.score_cv_against_offer.senior-backend-node",
  "runId": "2026-06-22T111500Z.openai-gpt-4.1-prompt-v2",
  "updatedAt": "2026-06-22T11:30:00.000Z",
  "score": 4,
  "comment": "Good analysis overall, but slightly too generous on the missing Node.js requirement.",
  "tags": [
    "missed_requirement",
    "overconfident_score"
  ]
}
```

Score scale:

- `0`: broken or unusable
- `1`: very poor
- `2`: insufficient
- `3`: acceptable
- `4`: good
- `5`: excellent

Only `score` is required when an annotation exists. `comment` and `tags` are optional.

## MVP UI

The app should open on the runs/experiments view.

### Runs View

Show:

- Run name
- Producer
- Action id
- Provider/model
- Created date
- Number of cases
- Number of completed/failed results
- Average human score when annotations exist

Primary actions:

- Open run
- Compare with another run from the same action
- Create new run from a suite or selected cases

### Run Detail View

Show:

- Run metadata
- Cases/results table
- Human score column
- Tags column
- Status column
- Quick filters for failed results, unscored results, and low scores

Selecting a result opens the review view.

### Result Review View

The review view must make prompt inspection easy.

Recommended layout:

- Header/sidebar: case name, run, model, score input, comment, tags
- Main panel with tabs:
  - Input
  - Output
  - Prompt
  - Variables
  - Raw JSON

The prompt tab must be one click away and should show the full rendered prompt/messages. The variables tab should show the captured `promptVariables` and, when available, the unresolved `promptTemplate`.

### Compare Runs View

Compare two runs for the same action/suite.

Show a table:

```txt
Case name | Run A score | Run B score | Delta | Status
```

Selecting a case opens side-by-side review:

- Input shared/collapsible
- Output A
- Output B
- Prompt A
- Prompt B
- Variables A/B
- Annotations A/B

This is optimized for prompt iteration, but also works for model comparison.

### New Run View

Allow:

- Select suite/action
- Select cases, default all
- Select provider
- Select model
- Set simple config such as temperature when supported
- Name the run
- Start execution

Execution should write `run.json` first, then write result files as each case completes.

## Providers

MVP providers:

1. `mock`
2. `openai`
3. `ollama`

Provider design should be provider-agnostic:

```ts
type EvalProvider = "mock" | "openai" | "ollama";

type ExecutePromptInput = {
  provider: EvalProvider;
  model: string;
  renderedPrompt: CapturedPrompt;
  temperature?: number;
};
```

OpenAI should use `OPENAI_API_KEY` and optional `OPENAI_BASE_URL`.

Ollama should use `OLLAMA_BASE_URL` and should not require an API key.

Mock should return deterministic output clearly marked as mock output.

## Execution Modes

MVP mode:

- `prompt_replay`: execute the captured `renderedPrompt` exactly as stored in the case.
- `variable_override`: edit `promptVariables`, render them into `promptTemplate`, then execute the rendered result.

Future mode:

- `template_regeneration`: use structured input with an Eval Studio prompt template or a captured Fabra prompt version.

For the MVP, implement `prompt_replay` first. `variable_override` is desirable if the prompt template and variables are present, but it should not block the first readable/reviewable version of the app. Do not implement full template regeneration in the first MVP unless there is spare time.

## File Safety

Eval Studio should:

- Read only within `EVAL_STUDIO_WORKSPACE`.
- Write only within `runs/` and `annotations/` for the MVP.
- Treat Fabra-produced case files as read-only in the UI.
- Use atomic writes where practical: write temp file, then rename.
- Preserve unknown JSON fields when editing annotations is not relevant; for annotations, rewriting the whole annotation file is acceptable.

## Validation

Add runtime validation for all artifact types.

Recommended approach:

- TypeScript types for artifact contracts.
- Zod schemas or equivalent runtime validators.
- Show invalid artifact errors in the UI without crashing the app.

Invalid files should appear in a diagnostics panel.

## Suggested Tech Stack

Recommended:

- Next.js or Vite React app for local web UI.
- Node server/API routes for filesystem reads/writes and provider calls.
- TypeScript.
- Zod for artifact validation.
- TanStack Query for server state if using React.

Keep the app simple. A local web app is enough; do not build desktop packaging in the MVP.

## Technical Architecture

Eval Studio should follow the same broad architectural approach as Fabra: domain-first backend modules, thin HTTP controllers, route-driven frontend features, explicit response contracts, and automated architecture checks.

The project is smaller than Fabra, so the first implementation should keep the number of modules low, but it should not skip the boundaries. The goal is to make the MVP easy to extend into a real evaluation product.

### Proposed Source Tree

Use a structure close to Fabra, adapted to a local filesystem-based app:

```txt
src/
  app/
    api/
      workspace/
      runs/
      annotations/
      providers/
  backend/
    modules/
      shared/
        domain/
        infrastructure/
        application/
      eval-workspace/
        domain/
        application/
        infrastructure/
        eval-workspace.module.ts
        index.ts
      eval-execution/
        domain/
        application/
        infrastructure/
        eval-execution.module.ts
        index.ts
  frontend/
    features/
      runs/
        api/
        hooks/
        components/
        index.ts
      run-review/
        api/
        hooks/
        components/
        index.ts
      run-comparison/
        api/
        hooks/
        components/
        index.ts
      new-run/
        api/
        hooks/
        components/
        index.ts
    components/
      shared/
      ui/
    utils/
  lib/
    container.ts
```

If Next.js is used, `src/app` owns route handlers and pages. If Vite is used, keep the same `backend/`, `frontend/`, and `lib/` split, and put HTTP handlers under a server folder with the same controller rules.

### Backend Modules

Start with two modules:

1. `eval-workspace`
2. `eval-execution`

`eval-workspace` owns the artifact model and filesystem persistence:

- Manifest
- Suite
- Case
- Run
- Result
- Annotation
- Workspace diagnostics
- Workspace scanning
- Annotation writes

`eval-execution` owns model execution:

- Provider selection
- Prompt replay
- Variable override execution when implemented
- Run creation
- Result writing during execution
- Usage, latency, error capture

Do not let frontend API routes read/write JSON files directly. Filesystem work belongs in infrastructure repositories/services behind application use cases.

### Module Shape

Each backend module should follow this shape:

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
  infrastructure/
    repositories/
    services/
  <module-name>.module.ts
  index.ts
```

Use cases receive dependencies through constructor injection. Infrastructure services implement domain repository/service ports. Module files are composition roots for the module and are imported by `src/lib/container.ts`.

Unlike Fabra, Eval Studio does not need Supabase-aware repositories. Its first repositories should be filesystem-aware, configured with the workspace root from environment/config.

### Domain Model

The domain should use entities and value objects even though persistence is JSON files.

Likely entities:

- `EvalSuite`
- `EvalCase`
- `EvalRun`
- `EvalResult`
- `EvalAnnotation`
- `ProviderConfiguration`

Likely value objects:

- `SuiteId`
- `CaseId`
- `RunId`
- `ResultId`
- `ActionId`
- `ProviderName`
- `ModelName`
- `PromptTemplate`
- `PromptVariables`
- `RenderedPrompt`
- `AnnotationScore`
- `AnnotationTags`
- `ISODateTime`
- `WorkspacePath`

Rules:

- Domain uses camelCase.
- Database-style `snake_case` is not needed in Eval Studio artifacts.
- Entities expose `create(params)`, `fromPrimitives(primitives)`, and `toPrimitives()`.
- Entity constructors should be private/protected.
- Value objects are immutable, have private/protected constructors, `fromPrimitives(...)`, and `toPrimitives()`.
- Repositories return aggregates/entities/value objects, not raw JSON blobs.
- Raw artifact JSON is boundary data and should be converted inside infrastructure repositories.

### Repository Ports

Repository interfaces live in `domain/repositories`.

Suggested ports:

```ts
interface EvalWorkspaceRepository {
  loadManifest(): Promise<EvalManifest>;
  listSuites(): Promise<EvalSuite[]>;
  listCases(criteria: ListCasesCriteria): Promise<EvalCase[]>;
  listRuns(criteria: ListRunsCriteria): Promise<EvalRun[]>;
  listResults(criteria: ListResultsCriteria): Promise<EvalResult[]>;
  findResultById(id: ResultId): Promise<EvalResult | null>;
  saveRun(run: EvalRun): Promise<void>;
  saveResult(result: EvalResult): Promise<void>;
  saveAnnotation(annotation: EvalAnnotation): Promise<void>;
  scanDiagnostics(): Promise<WorkspaceDiagnostic[]>;
}
```

Do not expose filesystem paths to use cases except where the use case is specifically about workspace configuration/diagnostics.

### Application Use Cases

Suggested MVP use cases:

- `LoadWorkspaceOverviewUseCase`
- `ListRunsUseCase`
- `GetRunDetailUseCase`
- `GetResultReviewUseCase`
- `SaveAnnotationUseCase`
- `CompareRunsUseCase`
- `ListAvailableProvidersUseCase`
- `CreateRunUseCase`
- `ExecuteRunUseCase`

Queries must be side-effect free. Commands/use cases that write files or call models must be explicit.

### Provider Services

Provider-specific services belong in `eval-execution/infrastructure/services`.

Use a provider-aware factory:

```txt
domain/repositories/eval-ai-service.repository.ts
infrastructure/services/mock-eval-ai.service.ts
infrastructure/services/openai-eval-ai.service.ts
infrastructure/services/ollama-eval-ai.service.ts
infrastructure/services/provider-eval-ai-service.factory.ts
```

The provider-aware factory receives provider-specific factories/services by constructor injection and delegates based on `{ provider, model }`.

Automated tests should use only the mock provider. Real provider calls must not run in tests.

### Prompt Template Handling

Prompt handling is part of the domain contract, not a string utility hidden in UI code.

Cases can contain:

- `promptTemplate`
- `promptVariables`
- `renderedPrompt`

Results must contain:

- the exact `renderedPrompt` that was executed
- the effective `promptVariables` when variables were used or edited

Template rendering should live in a domain service or application service, with tests. The renderer can be simple for MVP, but it must be deterministic and must fail clearly when a required variable is missing.

### API Controller Rules

HTTP route handlers are thin controllers. They should:

1. Read request data.
2. Validate request body/query through a sibling `validation.ts`.
3. Call module use cases from `src/lib/container.ts`.
4. Return response data through helpers and response builders.
5. Delegate error handling to a shared API error handler.

Each route folder should contain:

```txt
route.ts
validation.ts
responses.ts
```

`responses.ts` owns the serialized response contract and must be frontend-import-safe. Frontend API clients may import types from `responses.ts` with `import type`, but must never import from `route.ts`.

### API Route Examples

Suggested routes:

```txt
src/app/api/workspace/overview/route.ts
src/app/api/runs/route.ts
src/app/api/runs/[runId]/route.ts
src/app/api/runs/[runId]/results/[resultId]/route.ts
src/app/api/runs/compare/route.ts
src/app/api/annotations/route.ts
src/app/api/providers/route.ts
src/app/api/execute-runs/route.ts
```

Avoid action dispatch routes like one endpoint with `{ action: "saveAnnotation" | "executeRun" }`. Prefer one route per command/query.

### Frontend Architecture

Frontend code should follow Fabra's route-driven feature architecture:

```txt
src/frontend/features/<feature-name>/
  api/
  hooks/
  components/
  index.ts
```

Rules:

- Feature internals are private by default.
- Other features import only through the owning feature `index.ts`.
- Feature API clients call Eval Studio API routes and import response types from route `responses.ts`.
- Hooks own TanStack Query keys, mutations, invalidation, and local route state.
- Components receive already-shaped data from hooks.
- Components must not import backend modules or route handlers.
- Route/view components orchestrate; substantial UI regions are extracted into sibling components.
- Do not let `*-view.tsx` files grow into large monoliths.

Suggested feature split:

- `runs`: runs list and workspace overview.
- `run-review`: run detail and result review.
- `run-comparison`: compare two runs.
- `new-run`: provider/model selection and execution flow.

### UI Component Rules

Use a small shared UI layer rather than one-off controls:

- `src/frontend/components/ui/` for generic primitives.
- `src/frontend/components/shared/` for app-specific reusable pieces.
- Use shadcn/ui where useful.
- Use tables for run/result lists.
- Use tabs for `Input`, `Output`, `Prompt`, `Variables`, and `Raw JSON`.
- Use forms for annotations and run creation.
- Use stable component dimensions for dense review screens.

Eval Studio is a work tool, not a marketing page. The UI should be quiet, information-dense, and optimized for scanning and repeated review.

### Response Contracts

Every API route consumed by frontend code should expose response contracts in `responses.ts`.

Allowed flow:

```txt
backend module entity/value object
  -> src/app/api/**/responses.ts
  -> src/frontend/features/<feature>/api/*-api.ts
  -> src/frontend/features/<feature>/hooks/*
  -> src/frontend/features/<feature>/components/*
```

There should be exactly one response shape conversion between backend domain and frontend components, and it should live in `responses.ts`.

### Testing Expectations

Minimum tests:

- Domain entity/value object tests colocated beside source files.
- Template rendering tests.
- Filesystem repository tests using a temporary workspace.
- Use case tests with mock repositories/providers.
- Provider factory tests.
- API validation tests where request parsing is non-trivial.
- Frontend component/hook tests for review, annotation, and comparison flows.

Do not call OpenAI or Ollama in automated tests. Use deterministic mock provider output.

## Architecture Verification Scripts

Eval Studio should copy and adapt Fabra's architecture verification scripts early, not after the project has grown.

Source scripts in Fabra:

```txt
/Users/jon/DEV/repos/fabra/scripts/verify-ddd.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-ddd-tests.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-ddd-imports.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-ddd-entities.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-ddd-value-objects.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-ddd-repository-return-types.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-ddd-use-cases-return-types.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-ddd-services.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-query-bus.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-ddd-route-imports.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-ddd-barrel-exports.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-frontend-boundaries.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-frontend-api-response-contracts.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-frontend-components.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-ai-service-di.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-api-controllers.mjs
```

Scripts that probably need adaptation or removal for Eval Studio:

```txt
/Users/jon/DEV/repos/fabra/scripts/verify-ddd-supabase-repository-tables.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-technical-observability-boundaries.mjs
/Users/jon/DEV/repos/fabra/scripts/verify-shared-component-tones.mjs
```

`verify-ddd-supabase-repository-tables.mjs` is Fabra/Supabase-specific and should not be required for Eval Studio unless the app later adds a database. Eval Studio's equivalent should verify filesystem repository boundaries instead.

Recommended `package.json` scripts for Eval Studio:

```json
{
  "scripts": {
    "architecture:check": "node scripts/verify-ddd.mjs",
    "ddd:check": "node scripts/verify-ddd.mjs",
    "api:check": "node scripts/verify-api-controllers.mjs"
  }
}
```

When adapting the scripts, update path assumptions to match Eval Studio:

- Use `src/backend/modules/**`, not older `src/modules/**`.
- Keep `src/frontend/features/**` and `src/frontend/components/**`.
- Keep `src/app/api/**/route.ts`, `validation.ts`, and `responses.ts` checks if using Next.js.
- Remove Supabase-specific checks.
- Add filesystem repository checks if useful.

## Minimum Build Order for an Agent

1. Scaffold Eval Studio as a separate local web app.
2. Add `.env.local` support with `EVAL_STUDIO_WORKSPACE`.
3. Copy/adapt the architecture verification scripts from Fabra.
4. Create backend shared primitives, error handling, and module container.
5. Define artifact TypeScript types, domain entities/value objects, and validators.
6. Implement filesystem workspace repository for suites, cases, runs, results, and annotations.
7. Implement workspace scanning and diagnostics use cases.
8. Build runs list view.
9. Build run detail view.
10. Build result review view with editable score/comment/tags.
11. Implement annotation file writes.
12. Implement compare two runs view.
13. Implement provider abstraction.
14. Implement mock provider.
15. Implement OpenAI provider.
16. Implement Ollama provider.
17. Implement new run execution over selected cases using prompt replay.
18. Add basic diagnostics for invalid/missing artifacts.

## Out of Scope for MVP

- User accounts.
- Hosted deployment.
- Fabra database access.
- Supabase integration.
- Bidirectional live sync with Fabra.
- Synthetic case generation.
- Prompt registry.
- Multi-dimensional scoring.
- Pass/fail verdicts.
- Redaction/anonymization.
- CI integration.
- Automated LLM-as-judge scoring.

## Future Ideas

- Let Eval Studio generate cases into any app workspace that follows the artifact contract.
- Add JSON Schema files for the artifact contract.
- Add prompt template regeneration from structured input.
- Add model/provider comparison dashboards.
- Add cost and latency summaries.
- Add LLM-as-judge suggestions while keeping human score as source of truth.
- Add importers for public CV/job datasets.
- Add CI command for regression suites.
