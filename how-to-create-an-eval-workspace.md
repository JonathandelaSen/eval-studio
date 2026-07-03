# How to Create an Eval Workspace in Another Project

This guide is the complete contract for preparing evaluation data in another
project so Eval Studio can read it. It covers the minimum workspace, every
supported artifact, field requirements, naming rules, and a copy-ready example.

## What the other project must produce

Create an `evals/` directory inside the project that owns the evaluation data.
Eval Studio reads JSON files from that directory; it does not import application
code or start the source application.

For a new integration, the source project normally owns:

- `manifest.json`: identifies the workspace.
- `suites/**/suite.json`: groups related cases for one product action.
- `suites/**/*.case.json`: captures the input and exact prompt for each case.

That is enough for Eval Studio to discover cases and create new runs. The source
project may also export historical runs and results. Eval Studio normally writes
new runs, results, and human annotations itself.

## Quick start

From the root of the other project:

```sh
mkdir -p evals/suites/customer-support.answer-question/cases
mkdir -p evals/runs
mkdir -p evals/annotations
```

The smallest useful workspace has this shape:

```text
evals/
├── manifest.json
├── suites/
│   └── customer-support.answer-question/
│       ├── suite.json
│       └── cases/
│           └── refund-policy.case.json
├── runs/
└── annotations/
```

Use the complete `manifest`, `suite`, and `case` examples later in this guide,
then connect the `evals/` directory in Eval Studio under **Settings → Projects →
Add project**. Select `evals/` itself, not its parent project directory.

## Global rules

### File format

- Every artifact is a UTF-8 JSON file containing one JSON object.
- JSON comments and trailing commas are not allowed.
- Unknown properties are preserved or ignored, depending on the artifact. Do not
  rely on unknown properties for relationships or UI behavior.
- `schemaVersion: "1"` is recommended on every artifact. It documents the format
  for producers even though the current reader does not reject other versions.
- Use ISO 8601 UTC timestamps such as `2026-07-03T10:00:00.000Z`.
- Keep secrets out of the workspace. Prompt text, inputs, outputs, and source
  references are stored as plain text on disk.

### Identifier rules

Use stable identifiers and never recycle an identifier for different data.

| Identifier | Required format | Purpose |
| --- | --- | --- |
| `actionId` | UUID | Identifies one AI-backed product action across suites, cases, and runs. |
| `caseId` | UUID | Identifies one reproducible case across suites, runs, results, and annotations. |
| `suiteId` | UUID | Identifies a case collection across suite and run artifacts. |
| `runId` | Non-empty string | Identifies one experiment. It is also used as a directory name when Eval Studio writes a run. |
| `resultId` | Non-empty string | Identifies the result of one case in one run. |

Although the lightweight suite and case reader accepts plain strings, `actionId`,
`caseId`, and a run's non-null `suiteId` pass through UUID validation during
execution/import. Using UUIDs from the beginning avoids a workspace that can be
displayed but cannot be executed.

Recommended UUID forms:

```text
actionId: 11111111-1111-4111-8111-111111111111
caseId:   22222222-2222-4222-8222-222222222222
suiteId:  33333333-3333-4333-8333-333333333333
```

The same logical item must use exactly the same identifier everywhere. Folder
and file names do not establish relationships; IDs inside the JSON do.

### Discovery and file naming

Eval Studio scans the supported top-level directories recursively. The suffix is
part of the contract.

| Artifact | Search root | File name rule |
| --- | --- | --- |
| Manifest | `evals/` | Exactly `manifest.json` |
| Suite | `evals/suites/` | Exactly `suite.json` |
| Case | `evals/suites/` | Ends with `.case.json` |
| Run | `evals/runs/` | Ends with `.run.json` |
| Result | `evals/runs/` | Ends with `.result.json` |
| Annotation | `evals/annotations/` | Ends with `.annotation.json` |

For imported run metadata, use a name such as `metadata.run.json`; a bare
`run.json` is not discovered by the current reader. Nested directories are for
organization only. Do not put an artifact under the wrong search root.

Do not duplicate an ID. The reader loads every matching file and does not resolve
conflicts between duplicate suites, cases, runs, results, or annotations.

## Recommended complete layout

```text
evals/
├── manifest.json
├── suites/
│   └── customer-support.answer-question/
│       ├── suite.json
│       └── cases/
│           └── refund-policy.case.json
├── runs/
│   └── 2026-07-03T100000Z.eval-studio-mock/
│       ├── metadata.run.json
│       └── results/
│           └── refund-policy.result.json
└── annotations/
    └── 2026-07-03T100000Z.eval-studio-mock/
        └── refund-policy.annotation.json
```

## 1. Manifest

Create `evals/manifest.json`. It gives the connected project its display name.

```json
{
  "schemaVersion": "1",
  "workspaceName": "Acme customer-support evals",
  "createdAt": "2026-07-03T09:00:00.000Z"
}
```

| Field | Required | Type | Meaning |
| --- | --- | --- | --- |
| `schemaVersion` | Recommended | string | Producer-declared artifact contract version. Use `"1"`. |
| `workspaceName` | Yes | non-empty string recommended | Name shown for the project in Eval Studio. |
| `createdAt` | Yes | ISO 8601 string recommended | When the workspace was first created. |

If the manifest is missing or invalid, the directory can still be registered,
but Eval Studio reports a diagnostic and uses the directory name in project
settings.

## 2. Suite

A suite groups cases that evaluate the same product action. Create one
`suite.json` for each suite under `evals/suites/`.

```json
{
  "schemaVersion": "1",
  "suiteId": "33333333-3333-4333-8333-333333333333",
  "actionId": "11111111-1111-4111-8111-111111111111",
  "name": "Customer-support answer quality",
  "description": "Cases that check grounded answers to customer questions.",
  "caseIds": [
    "22222222-2222-4222-8222-222222222222"
  ]
}
```

| Field | Required | Type | Meaning |
| --- | --- | --- | --- |
| `schemaVersion` | Recommended | string | Use `"1"`. |
| `suiteId` | Yes | UUID string | Stable suite identifier, reusable from imported runs. |
| `actionId` | Yes | UUID string | Product action evaluated by every case in the suite. |
| `name` | Yes | string | Human-readable suite name. |
| `description` | No | string | Scope, quality bar, or intended use of the suite. |
| `caseIds` | Yes | array of strings | Exact IDs of the cases in the suite. Use at least one case. |

Keep `caseIds` synchronized with the case files. Eval Studio does not infer suite
membership from directories and does not verify that every referenced case
exists.

## 3. Case

A case is a reproducible situation for one AI-backed action. It should contain
enough information to inspect and replay the prompt without starting the source
application.

Create a file ending in `.case.json`, for example
`evals/suites/customer-support.answer-question/cases/refund-policy.case.json`.

```json
{
  "schemaVersion": "1",
  "caseId": "22222222-2222-4222-8222-222222222222",
  "actionId": "11111111-1111-4111-8111-111111111111",
  "name": "Refund request outside the refund window",
  "note": "The answer must explain the policy without inventing an exception.",
  "createdAt": "2026-07-03T09:15:00.000Z",
  "createdBy": {
    "source": "acme-api",
    "userRole": "support-agent"
  },
  "input": {
    "question": "Can I return an item bought 45 days ago?",
    "policy": "Returns are accepted within 30 days of purchase.",
    "language": "en"
  },
  "promptTemplate": {
    "format": "messages",
    "templateId": "customer-support.answer-question.v1",
    "messages": [
      {
        "role": "system",
        "content": "Answer only from the supplied policy. Reply in {{language}}."
      },
      {
        "role": "user",
        "content": "Policy: {{policy}}\n\nQuestion: {{question}}"
      }
    ]
  },
  "promptVariables": {
    "question": "Can I return an item bought 45 days ago?",
    "policy": "Returns are accepted within 30 days of purchase.",
    "language": "en"
  },
  "renderedPrompt": {
    "format": "messages",
    "messages": [
      {
        "role": "system",
        "content": "Answer only from the supplied policy. Reply in en."
      },
      {
        "role": "user",
        "content": "Policy: Returns are accepted within 30 days of purchase.\n\nQuestion: Can I return an item bought 45 days ago?"
      }
    ]
  },
  "runtime": {
    "provider": "openai",
    "model": "gpt-4.1",
    "temperature": 0.2
  },
  "expectedOutput": {
    "kind": "json",
    "schemaRef": "acme://customer-support/answer/v1",
    "criteria": [
      "States that the standard refund window is 30 days",
      "Does not promise a refund or fabricate an exception"
    ]
  },
  "source": {
    "app": "acme-api",
    "route": "/support/conversations/example",
    "entityRefs": {
      "conversationId": "example"
    }
  }
}
```

### Required case fields

| Field | Type | Meaning |
| --- | --- | --- |
| `caseId` | UUID string | Stable identity of the case. |
| `actionId` | UUID string | Must match the suite and the action used for runs. |
| `name` | string | Short description visible to reviewers. |
| `createdAt` | ISO 8601 string recommended | When the case was captured or authored. |
| `renderedPrompt` | object | The exact prompt that can be inspected or replayed. |
| `renderedPrompt.format` | non-empty string | Prompt representation, normally `"messages"` or `"text"`. |

For `format: "messages"`, use a `messages` array whose entries contain `role` and
`content`. For `format: "text"`, store the final string in a `text` property.
Eval Studio currently requires only a non-empty `format`, but a complete shape is
necessary for people and future providers to interpret the prompt reliably.

### Optional case fields

| Field | Type | Meaning |
| --- | --- | --- |
| `note` | string | What is difficult or important about this case. |
| `createdBy` | object | Provenance of the captured case. Choose keys meaningful to the source project. |
| `input` | object | Original business input before prompt rendering. |
| `promptTemplate` | object with `format` | Template before variables were substituted. |
| `promptVariables` | object | Exact values used to render the prompt. |
| `runtime` | object | Provider/model configuration at capture time. This is descriptive on a case. |
| `expectedOutput` | object | Expected shape, rubric, assertions, or schema reference. |
| `source` | object | Traceability back to the source app, route, or domain entities. |

`input`, `promptTemplate`, `promptVariables`, `expectedOutput`, and `source` are
open JSON objects. Define them consistently within a product action. The most
important distinction is:

- `input` is the original domain/business data.
- `promptVariables` is what the template renderer consumed.
- `renderedPrompt` is the final prompt sent, or ready to be sent, to the model.

Never make Eval Studio reverse-engineer the final prompt from `input`. Always
include `renderedPrompt`.

## 4. Run (optional import)

A run represents one experiment over one or more cases. Only create run files in
the source project when importing historical executions. New Eval Studio runs are
written automatically.

Place the file below `evals/runs/` and make its name end in `.run.json`, for
example `evals/runs/2026-07-03T100000Z.eval-studio-mock/metadata.run.json`.

```json
{
  "schemaVersion": "1",
  "runId": "2026-07-03T100000Z.eval-studio-mock-mock-evaluator",
  "name": "Customer support baseline",
  "actionId": "11111111-1111-4111-8111-111111111111",
  "producer": "eval-studio",
  "createdAt": "2026-07-03T10:00:00.000Z",
  "caseIds": [
    "22222222-2222-4222-8222-222222222222"
  ],
  "runtime": {
    "provider": "mock",
    "model": "mock-evaluator",
    "temperature": 0
  },
  "notes": "Initial deterministic baseline.",
  "suiteId": "33333333-3333-4333-8333-333333333333"
}
```

| Field | Required | Type and constraints |
| --- | --- | --- |
| `runId` | Yes | Non-empty string, unique in the workspace. |
| `name` | Yes | Non-empty string. |
| `actionId` | Yes | UUID string matching the evaluated cases. |
| `producer` | Yes | Currently must be exactly `"eval-studio"`. |
| `createdAt` | Yes | Valid date string; ISO 8601 UTC is recommended. |
| `caseIds` | Yes | Non-empty array of UUID strings. |
| `runtime` | Yes for a configured run | Runtime object or `null`. |
| `notes` | No | String or `null`. Missing/blank values normalize to `null`. |
| `suiteId` | No | UUID string or `null`. Missing/blank values normalize to `null`. |
| `schemaVersion` | Recommended | String `"1"`; ignored when the run is normalized. |

Runtime fields:

| Field | Required | Type and constraints |
| --- | --- | --- |
| `provider` | Yes | One of `"mock"`, `"openai"`, `"ollama"`, or `"apple"`. |
| `model` | Yes | Non-empty string. |
| `temperature` | No | Number from `0` through `2`, or `null`. |

The current execution contract accepts only `producer: "eval-studio"`, including
for imported run/result files. Do not label imported data with the source
application name in `producer`; put source provenance in case metadata or run
notes instead.

## 5. Result (optional import)

A result is the output for one case in one run. Place result files anywhere below
`evals/runs/` with a name ending in `.result.json`.

Completed result example:

```json
{
  "schemaVersion": "1",
  "resultId": "2026-07-03T100000Z.eval-studio-mock-mock-evaluator.22222222-2222-4222-8222-222222222222",
  "caseId": "22222222-2222-4222-8222-222222222222",
  "runId": "2026-07-03T100000Z.eval-studio-mock-mock-evaluator",
  "producer": "eval-studio",
  "createdAt": "2026-07-03T10:00:01.000Z",
  "runtime": {
    "provider": "mock",
    "model": "mock-evaluator",
    "temperature": 0
  },
  "promptVariables": {
    "question": "Can I return an item bought 45 days ago?",
    "policy": "Returns are accepted within 30 days of purchase.",
    "language": "en"
  },
  "renderedPrompt": {
    "format": "messages",
    "messages": [
      {
        "role": "system",
        "content": "Answer only from the supplied policy. Reply in en."
      },
      {
        "role": "user",
        "content": "Policy: Returns are accepted within 30 days of purchase.\n\nQuestion: Can I return an item bought 45 days ago?"
      }
    ]
  },
  "rawOutput": "{\"answer\":\"The standard return window is 30 days.\"}",
  "parsedOutput": {
    "answer": "The standard return window is 30 days."
  },
  "status": "completed",
  "error": null,
  "usage": {
    "inputTokens": 54,
    "outputTokens": 12,
    "costUsd": null
  },
  "latencyMs": 180
}
```

| Field | Required | Type and constraints |
| --- | --- | --- |
| `resultId` | Yes | Non-empty string, unique in the workspace. |
| `caseId` | Yes | UUID string matching an existing case and the run's `caseIds`. |
| `runId` | Yes | Non-empty string matching an existing run. |
| `producer` | Yes | Currently must be exactly `"eval-studio"`. |
| `createdAt` | Yes | Valid date string; ISO 8601 UTC is recommended. |
| `renderedPrompt` | Yes | Exact prompt used. Its `format` must be non-empty. |
| `status` | Yes | Exactly `"completed"` or `"failed"`. |
| `error` | Yes | `null` for success; an error object for failure. |
| `runtime` | No | Same runtime object as a run, or `null`. |
| `promptVariables` | No | Object containing the effective variables used for this execution. |
| `rawOutput` | Recommended | Provider output before parsing; any JSON value or `null`. |
| `parsedOutput` | Recommended | Parsed/structured output; any JSON value or `null`. |
| `usage` | No | Any JSON value or `null`; the token/cost object shown above is recommended. |
| `latencyMs` | No | Finite non-negative number or `null`. |

Persist `renderedPrompt` on every result even when it is identical to the case.
This makes each execution auditable if variables or prompt generation change.

Failed result example:

```json
{
  "schemaVersion": "1",
  "resultId": "2026-07-03T100000Z.eval-studio-mock-mock-evaluator.22222222-2222-4222-8222-222222222222",
  "caseId": "22222222-2222-4222-8222-222222222222",
  "runId": "2026-07-03T100000Z.eval-studio-mock-mock-evaluator",
  "producer": "eval-studio",
  "createdAt": "2026-07-03T10:00:01.000Z",
  "runtime": {
    "provider": "openai",
    "model": "gpt-4.1",
    "temperature": 0.2
  },
  "promptVariables": {},
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
  "latencyMs": null
}
```

`provider_error` is the only supported non-empty error code. Keep successful and
failed shapes semantically consistent even though the reader does not currently
cross-check `status` against `error`.

## 6. Annotation (optional import)

An annotation is one editable human judgment for a result. Eval Studio creates
these while reviewing, so source projects usually do not need to provide them.

Place annotation files below `evals/annotations/` with a name ending in
`.annotation.json`.

```json
{
  "schemaVersion": "1",
  "resultId": "2026-07-03T100000Z.eval-studio-mock-mock-evaluator.22222222-2222-4222-8222-222222222222",
  "caseId": "22222222-2222-4222-8222-222222222222",
  "runId": "2026-07-03T100000Z.eval-studio-mock-mock-evaluator",
  "updatedAt": "2026-07-03T10:15:00.000Z",
  "score": 4,
  "comment": "Correct and grounded, but it could explain the next available option.",
  "tags": ["grounded", "incomplete-next-step"]
}
```

| Field | Required | Type and constraints |
| --- | --- | --- |
| `resultId` | Yes | Non-empty string matching a result. |
| `caseId` | Yes | UUID string matching that result's case. |
| `runId` | Yes | Non-empty string matching that result's run. |
| `updatedAt` | Yes | Valid date string; ISO 8601 UTC is recommended. |
| `score` | Yes | Integer from `0` through `5`. |
| `comment` | No | Free-text reviewer comment. |
| `tags` | No | Array of strings. Use stable, reusable tag names. |

Score meaning:

| Score | Meaning |
| --- | --- |
| `0` | Broken or unusable |
| `1` | Very poor |
| `2` | Insufficient |
| `3` | Acceptable |
| `4` | Good |
| `5` | Excellent |

Use at most one annotation per result unless the application later introduces a
reviewer identity. Multiple files for the same result are ambiguous.

## Producer checklist

Before connecting or refreshing the workspace, verify all of the following:

- `evals/manifest.json` exists and contains `workspaceName` and `createdAt`.
- Every suite file is named exactly `suite.json`.
- Every case, run, result, and annotation has the required suffix.
- Every `suiteId`, `actionId`, and `caseId` is a UUID.
- A suite's `actionId` matches all its cases.
- Every `caseId` in a suite has a corresponding case file.
- Every case contains the exact final `renderedPrompt` and a non-empty `format`.
- Every run has at least one case and uses only `mock`, `openai`, `ollama`, or `apple`.
- Imported runs and results use `producer: "eval-studio"`.
- Every result references an existing run and case, and preserves the prompt used.
- Every annotation references an existing result, run, and case.
- IDs are unique and identical at every reference point.
- JSON parses without comments or trailing commas.
- No secrets or data that must not be stored in plain text are included.

## Connecting and diagnosing

1. Start Eval Studio.
2. Open **Settings**.
3. Under **Projects**, choose **Add project**.
4. Navigate to and select the other project's `evals/` directory.
5. Return to the runs workspace and inspect **Diagnostics**.

An invalid artifact does not prevent valid sibling files from loading. Eval
Studio reports the relative path and validation error for each bad file.

Common causes of missing or invalid data:

| Symptom | Check |
| --- | --- |
| Project has the wrong name | Confirm `manifest.json` is at the selected directory root and `workspaceName` is a string. |
| Suite or case does not appear | Confirm it is under `suites/` and has the exact required file name/suffix. |
| Run does not appear | Confirm its file ends in `.run.json`; `run.json` alone is not discovered by the current reader. |
| Result or annotation does not appear | Confirm it is under the correct search root and has the correct suffix. |
| Creating a run fails with an ID error | Replace slug-style `actionId` and `caseId` values with UUIDs everywhere. |
| Runtime is rejected | Use `mock`, `openai`, `ollama`, or `apple`; use a non-empty model and temperature from `0` to `2`. |
| Imported run/result is rejected | Use `producer: "eval-studio"` and verify all required IDs and timestamps. |
| Data appears disconnected | Compare referenced IDs character-for-character; paths do not create relationships. |

When generating these files from application code, write to a temporary file and
rename it into place after the JSON is complete. That prevents Eval Studio from
reading a partially written artifact during a refresh.
