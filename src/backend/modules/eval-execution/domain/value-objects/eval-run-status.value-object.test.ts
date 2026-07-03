import { describe, expect, it } from "vitest";
import { EvalRunStatus } from "./eval-run-status.value-object";
describe("EvalRunStatus", () => { it("represents completion with failures", () => expect(EvalRunStatus.completed(true).toPrimitives()).toBe("completed_with_failures")); });
