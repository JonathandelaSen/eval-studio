import { describe, expect, it } from "vitest";
import { EvalRuntimeMetadataNullable } from "./eval-runtime-metadata-nullable.value-object";
describe("EvalRuntimeMetadataNullable", () => { it("preserves a digest", () => expect(EvalRuntimeMetadataNullable.fromPrimitives({ modelDigest: "sha256:abc" }).toPrimitives()).toEqual({ modelDigest: "sha256:abc" })); });
