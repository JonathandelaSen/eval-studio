import { describe, expect, it } from "vitest";
import { SchemaVersion } from "./schema-version.value-object";
describe("SchemaVersion", () => { it("uses the current version", () => expect(SchemaVersion.current().toPrimitives()).toBe("1")); });
