# How to Create an API Route

API routes live under `src/app/api/**` and form the HTTP boundary of Eval
Studio. A route validates and normalizes HTTP input, resolves the required DDD
module from the composition root, invokes one application use case, and maps the
result to an explicit HTTP response contract.

Routes contain **no business rules** and never access repositories directly.
Domain behaviour belongs in module entities, Value Objects, and use cases. See
[How to Create a Module](how-to-create-a-module.md) before introducing an API
for a capability that does not yet have an owning module.

---

## 1. When to Create an API Route

Create an API route when the application needs an HTTP boundary for:

- A Client Component that must read server-owned data.
- A mutation that must be callable through HTTP.
- An external client, webhook, or integration.
- A stable transport contract shared by multiple frontend consumers.

Do not create an internal API round trip for a Server Component that can call a
module use case directly. Do not create a route to compensate for a missing
domain use case; model the application intention in its module first.

Each route represents a resource or one explicit command. Never dispatch
multiple commands from a body field such as `action`, `command`, or `operation`.
Create a dedicated route for each command instead.

---

## 2. Required Folder Layout

Every route folder owns three colocated files:

```text
src/app/api/<resource>/route.ts
src/app/api/<resource>/responses.ts
src/app/api/<resource>/validation.ts
```

Dynamic and command segments get their own folder with the same trio:

```text
src/app/api/projects/[projectId]/route.ts
src/app/api/projects/[projectId]/responses.ts
src/app/api/projects/[projectId]/validation.ts

src/app/api/projects/[projectId]/select/route.ts
src/app/api/projects/[projectId]/select/responses.ts
src/app/api/projects/[projectId]/select/validation.ts
```

This layout is enforced by `scripts/verify-api-controllers.mjs`. Even a `GET`
route with no body keeps a `validation.ts`; it can own query or path-parameter
parsing now or provide the explicit place for it later.

The files have separate responsibilities:

- `validation.ts` parses untrusted HTTP input into a typed primitive input.
- `responses.ts` defines and builds the serialized success payload.
- `route.ts` translates HTTP into one use-case call and a standardized response.

---

## 3. Validate the Request (`validation.ts`)

Treat bodies, query parameters, headers, and dynamic path parameters as
untrusted input. Parse and normalize them before invoking a module.

Prefer a schema when validation has multiple fields or branches. A parser may
return a discriminated result so the route can short-circuit without throwing:

```typescript
export type CreateProjectRequest = {
  directory: string;
};

export type RequestValidationError = {
  code: "invalid_request";
  message: string;
  details?: unknown;
};

export function parseCreateProjectRequest(
  body: unknown,
):
  | { ok: true; value: CreateProjectRequest }
  | { ok: false; error: RequestValidationError } {
  // Parse, trim, and normalize HTTP input here.
  // Do not enforce domain invariants here.
}
```

Validation at this layer covers transport concerns such as missing JSON fields,
wrong primitive types, malformed query parameters, or invalid JSON syntax.
Domain invariants still belong in Value Objects and entities.

Rules:

1. Accept `unknown`, not a trusted cast of `request.json()`.
2. Normalize transport details such as trimming or query-string conversion.
3. Return primitive use-case input, never construct infrastructure objects.
4. Do not duplicate domain validation already owned by a Value Object.
5. Do not call modules, repositories, or the filesystem from `validation.ts`.

---

## 4. Define the Success Contract (`responses.ts`)

`responses.ts` is the only place where a route's successful serialized payload
is defined. It contains response types and pure builders that translate domain
primitives into those types.

```typescript
import type { ProjectPrimitives } from "@/backend/modules/project";

export interface ProjectResponse {
  id: string;
  name: string;
  directory: string;
}

export type ListProjectsResponse = ProjectResponse[];
export type CreateProjectResponse = ProjectResponse;

export function toProjectResponse(project: ProjectPrimitives): ProjectResponse {
  return {
    id: project.projectId,
    name: project.name,
    directory: project.directory,
  };
}

export function toProjectsResponse(
  projects: ProjectPrimitives[],
): ListProjectsResponse {
  return projects.map(toProjectResponse);
}
```

Rules:

1. Response contract type names end in `Response`.
2. New contracts use `camelCase`.
3. Every payload has a `toXxxResponse(...)` builder.
4. The route calls `toPrimitives()` on returned domain objects before passing
   them to the builder.
5. Builders are pure and contain transport mapping only, not business rules.
6. Frontend code imports response types from `responses.ts`, never `route.ts`.

### Frontend-safe requirement

`responses.ts` must remain safe for type imports from frontend code. It must not
import:

- `next/server` or `server-only`.
- `@/lib/container`.
- Route handlers or request context.
- Module infrastructure.
- Filesystem, database, or provider SDKs.

Type-only imports from a module barrel are allowed because they disappear at
compile time:

```typescript
import type { ProjectPrimitives } from "@/backend/modules/project";
```

A nested route may re-export a parent response builder or alias its type instead
of duplicating the contract.

---

## 5. Standardized HTTP Responses

Eval Studio uses one shared HTTP response layer for successful and failed
responses.

The implementation lives in the HTTP layer:

```text
src/app/api/_shared/api-responses.ts
src/app/api/_shared/api-error-handler.ts
```

It provides:

| Helper                  |   Status | Responsibility                                              |
| ----------------------- | -------: | ----------------------------------------------------------- |
| `ok(data)`              |      200 | Serialize a successful read or update                       |
| `created(data)`         |      201 | Serialize a successfully created resource                   |
| `noContent()`           |      204 | Return a successful response without a body                 |
| `errorResponse(error)`  | variable | Serialize a known validation or HTTP error                  |
| `handleApiError(error)` | variable | Map an unknown caught error to the canonical error contract |

The shared layer, not each route, must own:

- Success serialization and headers.
- The canonical error payload shape.
- Mapping known domain/application errors to HTTP status codes.
- The safe fallback for unknown errors without leaking stack traces or internal
  filesystem details.
- Optional error details for validation failures.

Successful helpers serialize the typed payload directly. Errors use this shared
shape:

```typescript
type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

Do not invent a different success or error envelope in an individual route.

The helpers belong under `src/app/api/_shared`, not in a domain module, because
`Response`, HTTP status codes, and headers are transport concerns.

---

## 6. Write the Handler (`route.ts`)

Every handler follows the same sequence:

1. Enter a `try` block.
2. Read the relevant HTTP input.
3. Parse it through `validation.ts`.
4. Return the standardized validation error when parsing fails.
5. Resolve the owning DDD module from the composition root.
6. Execute one application use case.
7. Convert returned domain objects to primitives.
8. Build the payload through `responses.ts`.
9. Return it through the standardized success helper.
10. Delegate unknown errors to the shared API error handler.

Canonical example:

```typescript
import { created, errorResponse } from "@/app/api/_shared/api-responses";
import { handleApiError } from "@/app/api/_shared/api-error-handler";
import { ProjectDirectoryUnreadableError } from "@/backend/modules/project";
import { getProjectModule } from "@/lib/container";
import { toProjectResponse } from "./responses";
import { parseCreateProjectRequest } from "./validation";

export async function POST(request: Request) {
  try {
    const parsed = parseCreateProjectRequest(await request.json());
    if (!parsed.ok) return errorResponse(parsed.error);

    const projectModule = await getProjectModule();
    const project = await projectModule.addProject.execute(
      parsed.value,
    );

    return created(toProjectResponse(project.toPrimitives()));
  } catch (error: unknown) {
    if (error instanceof ProjectDirectoryUnreadableError) {
      return errorResponse({
        status: 400,
        code: "project_directory_unreadable",
        message: error.message,
      });
    }
    return handleApiError(error);
  }
}
```

Do not add route-local substitutes with the same responsibility.

### Dynamic parameters in Next.js 15+

Route `params` are asynchronous and must be awaited:

```typescript
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  // Parse projectId, then invoke the use case.
}
```

### Module access

Routes access capabilities through a module factory exposed by the composition
root. They must not:

- Instantiate repositories.
- Import module infrastructure.
- Call repository methods directly.
- Reproduce entity or Value Object rules.
- Bind request-specific database clients to modules.

If the required operation is missing, add a use case to the owning module before
adding controller logic.

---

## 7. Error Handling

The route distinguishes three error sources:

1. **Malformed HTTP input**: returned immediately through the
   `errorResponse(...)` helper.
2. **Specific domain or application errors requiring custom status/codes**: caught inside the route handler's `catch` block and returned using `errorResponse(...)`. These must **never** be handled in the generic `handleApiError(...)`.
3. **General validation or unknown failures**: delegated to the shared `handleApiError(...)` function (which covers `ZodError` mapping and fallback to `500` `internal_error`).

Do not:

- Repeat `Response.json({ error: ... })` in every handler.
- Handle specific domain/application errors in the generic `handleApiError` utility.
- Return `error.message` blindly to clients.
- Catch an error only to discard it or silently return success.
- Import an HTTP response helper into the domain or application layer.

The future shared error layer should use stable machine-readable codes as well
as human-readable messages. Frontend behaviour must branch on codes or status,
not exact message text.

---

## 8. Frontend Consumption

The allowed data flow is:

```text
src/backend/modules/<module>         domain objects and primitives
                ↓
src/app/api/**/responses.ts          HTTP payload builders and types
                ↓
src/frontend/features/<feature>/api  typed fetch client
                ↓
src/frontend/features/<feature>/hooks
                ↓
src/frontend/features/<feature>/components
```

Frontend API clients import response types with `import type`:

```typescript
import type { ListProjectsResponse } from "@/app/api/projects/responses";
```

An exported frontend API function that calls `fetch` must return through the
project's shared JSON reader using a named `*Response` contract from the route's
`responses.ts`. This is enforced by
`scripts/verify-frontend-api-response-contracts.mjs`.

Components do not call `fetch` directly. HTTP orchestration belongs in a feature
API client and server-state logic belongs in feature hooks.

---

## 9. Testing

Test the boundary behaviour of each handler:

- Valid input reaches the intended use case and returns the expected status and
  response contract.
- Invalid input short-circuits before the use case.
- Domain/application errors map to the canonical status and error code.
- Unknown errors do not leak internal details.
- Dynamic parameters and query values are normalized correctly.

Test `validation.ts` parsers and `responses.ts` builders as pure functions. Keep
route tests focused on HTTP orchestration rather than retesting domain rules.

Follow TDD: write the failing boundary test, verify the expected failure,
implement the minimum route behaviour, and run the test again.

---

## 10. Verification Checklist

Before considering an API route complete:

- [ ] The capability already belongs to a DDD module.
- [ ] The route represents one resource or explicit command.
- [ ] `route.ts`, `responses.ts`, and `validation.ts` are colocated.
- [ ] All HTTP input is parsed from `unknown` before module access.
- [ ] Transport validation does not duplicate domain invariants.
- [ ] The route calls a use case, never a repository.
- [ ] The route imports no module infrastructure.
- [ ] Domain objects are converted with `toPrimitives()` before response mapping.
- [ ] The success payload is built in `responses.ts`.
- [ ] Response type names end in `Response` and use `camelCase`.
- [ ] `responses.ts` is frontend-import-safe.
- [ ] Success and failure use the shared standardized response layer.
- [ ] Specific domain/application errors requiring custom status/codes are caught locally in the route handler's catch block, not in `handleApiError`.
- [ ] Unknown errors are delegated to the shared API error handler.
- [ ] Frontend code imports types from `responses.ts`, never `route.ts`.
- [ ] Tests cover valid input, invalid input, and error mapping.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes without new warnings.
- [ ] `npm test` passes.
- [ ] `npm run rules:check` passes without new violations.

---

## 11. Common Mistakes

- Placing business logic or state-transition rules in `route.ts`.
- Accessing a repository or filesystem directly from a route.
- Creating an API route before the owning module use case exists.
- Casting `request.json()` directly to a trusted input type.
- Defining success payloads inline instead of in `responses.ts`.
- Returning a domain object or persistence record without explicit mapping.
- Importing `route.ts` from frontend code.
- Making `responses.ts` depend on server-only code.
- Dispatching several commands from an `action` field.
- Repeating ad hoc success and error envelopes in every handler.
- Leaking caught error messages, paths, or stack traces to clients.
