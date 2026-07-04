# Serialize all run execution through a single global queue

Eval Studio executes runs against local providers (primarily Ollama), where concurrent model execution competes for memory and GPU, degrading latency and distorting eval results. We decided that the server executes at most one run at a time: every run is created in `queued` status and a global in-process queue chains executions sequentially, regardless of how or when the runs were started.

## Considered Options

- **Serialize only within a multi-model batch** — rejected: two runs launched separately would still collide on the same local provider.
- **Frontend-orchestrated sequencing** (create the next run when the previous finishes) — rejected: closing the tab kills the sequence; the queue must live server-side.
- **Batch execution endpoint** (one job loops over N models) — rejected: creates a second execution path and runs would not exist (or be visible) until their turn.

## Consequences

- Throughput is deliberately sacrificed: even runs against remote or mock providers wait their turn.
- A failed or interrupted run does not stop the queue; the remaining queued runs execute.
- A multi-model launch is just N independent runs enqueued at creation time; no batch entity exists.
