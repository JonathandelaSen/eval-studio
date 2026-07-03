# How to Create a Domain Error

In this codebase, domain errors are structured to propagate cleanly from the backend modules to the API layer, and eventually to the frontend with correct translations.

Follow these steps to create and use a new domain error:

## Step 1: Register the Error Code

Error codes are defined centrally in a single, dependency-free registry. Add your new error code to [error-codes.ts](src/shared/error-codes.ts):

```typescript
export const ErrorCode = {
  // ...
  
  // Your module/domain name
  MY_NEW_DOMAIN_ERROR: "MY_NEW_DOMAIN_ERROR",
} as const;
```

## Step 2: Add Translations

Map the error code to user-facing messages in both English and Spanish in `src/frontend/i18n/messages.ts` (once the i18n translation system is fully integrated on the frontend):

### English:
```typescript
    errors: {
      // ...
      MY_NEW_DOMAIN_ERROR: "This is the user-facing English error message.",
    }
```

### Spanish:
```typescript
    errors: {
      // ...
      MY_NEW_DOMAIN_ERROR: "Este es el mensaje de error traducido al español.",
    }
```

## Step 3: Implement the Custom Domain Error Class

Create a new file in your module's `domain/errors/` directory (e.g., `src/backend/modules/my-module/domain/errors/my-new-domain.error.ts`) extending `DomainError` from the shared module:

```typescript
import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class MyNewDomainError extends DomainError {
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      ErrorCode.MY_NEW_DOMAIN_ERROR,
      `Developer-facing English log message: ${reason}`,
      data,
    );
    this.name = "MyNewDomainError";
  }
}
```

*Note: The second parameter in `super()` is the developer-facing `message` used in Sentry and logging. The third parameter `data` allows you to attach any structured metadata.*

## Step 4: Export the Error Class

Export the error class from the module's barrel file (e.g., `src/backend/modules/my-module/index.ts`):

```typescript
export { MyNewDomainError } from "./domain/errors/my-new-domain.error";
```

## Step 5: Throw and Handle the Error

Throw the error inside your domain entity, service, or use case:

```typescript
throw new MyNewDomainError("Invalid state encountered", { entityId });
```

The API routes handle domain errors automatically via `handleApiError()` (imported from `@/app/api/_shared/api-error-handler`), mapping `DomainError` subclasses to the appropriate HTTP status code (typically `404` for `*NotFoundError` or `400` otherwise) with the metadata payload.

---

## Reference: Base DomainError Class

Defined in [domain-error.ts](src/backend/modules/shared/domain/errors/domain-error.ts):

```typescript
import { ErrorCode } from "@/shared/error-codes";

/**
 * Base class for domain errors. Subclasses carry a stable machine-readable
 * `code` (mapped to localized copy by the frontend) and an optional `details`
 * payload for interpolation or UI. The `message` passed to `super(...)` is a
 * developer-facing English string for logs/Sentry and is never displayed.
 */
export class DomainError extends Error {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.details = details;
  }
}
```
