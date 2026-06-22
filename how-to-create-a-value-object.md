# How to Create a Value Object

A **Value Object** is one of the fundamental building blocks in Domain-Driven Design (DDD). Unlike Entities, Value Objects do not have a conceptual identity of their own; they are defined solely by the value of their attributes.

---

## 1. Core Characteristics

* **Immutability**: Once created, their values cannot be changed. If a different value is needed, a new instance of the Value Object must be created.
* **Value-Based Equality**: Two instances of a Value Object are considered equal if their underlying primitive values are equal (`equals()`).
* **Validation in Constructor**: Validation rules (invariants) are checked immediately inside the constructor, ensuring an object never exists in an invalid state.
* **Side-Effect-Free**: Methods inside a Value Object must be pure and free of side-effects.

---

## 2. Types of Value Objects

We distinguish three primary patterns in our architecture:

1. **Simple Wrappers**: Wrap a single primitive value (e.g. `string` or `number`) adding basic validation (e.g. `Timestamp` or `HumanScore`).
2. **Composite Value Objects**: Wrap multiple fields or other complex Value Objects.
3. **Enum-like or Status Value Objects**: Represent a closed set of allowed values (e.g. types, providers, or producers). Beyond validating that the value is allowed, they expose static semantic constructors and boolean checking methods (`isX()`).

---

## 3. Code Validation Rules (DDD Checks)

Our architectural verification script (`npm run rules:check`) enforces the following strict guidelines when designing Value Objects:

1. **Private or Protected Constructor**: Public instantiation using `new ValueObject()` is disallowed. You must always use `fromPrimitives()` or semantic static factory methods.
2. **Validation in Constructor**: All validation checks and exception throwing must happen inside the constructor, never inside `fromPrimitives`.
3. **Domain-Specific Errors**: Generic exceptions (`throw new Error(...)`) are not allowed. You must define a private, file-local domain error class (e.g. `ProducerError`) at the top of the file (unexported).
4. **No Literals in Methods**: Raw string/numeric/template/bigint literals are disallowed inside the Value Object's methods. All literals for comparison, initialization, or error messages must be extracted as constants at the file level (outside the class).

---

## 4. Reference Example: Enum-like Value Object (`Producer`)

Below is the complete implementation of the [Producer](file:///Users/jon/DEV/repos/eval-studio/src/backend/modules/eval-execution/domain/value-objects/producer.value-object.ts) Value Object, which serves as the reference template for enum-like or status-based Value Objects:

```typescript
import { ValueObject } from "@/backend/modules/shared";

// 1. Allowed values and constants defined at the file level (outside the class)
export const PRODUCERS = {
  evalStudio: "eval-studio",
} as const;

// 2. Unexported domain-specific error class
class ProducerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProducerError";
  }
}

const EMPTY_PRODUCER_MESSAGE = "Producer cannot be empty.";
const INVALID_PRODUCER_MESSAGE_PREFIX = "Invalid producer: ";

// 3. Value Object Definition
export class Producer extends ValueObject<string> {
  private readonly value: string;

  // 4. Constructor validates invariants and matches against allowed values
  private constructor(value: string) {
    super();
    const trimmed = value.trim();
    if (!trimmed) {
      throw new ProducerError(EMPTY_PRODUCER_MESSAGE);
    }
    const matched = Object.values(PRODUCERS).find((p) => p === trimmed);
    if (!matched) {
      throw new ProducerError(INVALID_PRODUCER_MESSAGE_PREFIX + value);
    }
    this.value = matched;
  }

  // 5. Static factory method from primitive types
  static fromPrimitives(value: string): Producer {
    return new Producer(value);
  }

  // 6. Semantic constructors (literal-free)
  static evalStudio(): Producer {
    return new Producer(PRODUCERS.evalStudio);
  }

  // 7. Boolean checkers (literal-free)
  isEvalStudio(): boolean {
    return this.value === PRODUCERS.evalStudio;
  }

  // 8. Conversion to primitives
  toPrimitives(): string {
    return this.value;
  }
}
```

---

## 5. Reference Example: Composite Value Object (`EvalRuntime`)

A **Composite Value Object** wraps several other Value Objects as a single cohesive value. The key differences from the enum-like pattern: its primitives shape is an object (`{ClassName}Primitives`), `fromPrimitives()` rehydrates each inner Value Object, `toPrimitives()` delegates to each of them, and optional inner fields are handled explicitly (here `temperature`).

Below is the [EvalRuntime](src/backend/modules/eval-execution/domain/value-objects/eval-runtime.value-object.ts) Value Object, the reference template for composites:

```typescript
import { ValueObject } from "@/backend/modules/shared";
import { EvalModel } from "./eval-model.value-object";
import { EvalProvider } from "./eval-provider.value-object";
import { EvalTemperature } from "./eval-temperature.value-object";

// 1. Primitives shape is an object. Optional inner fields stay optional here.
export interface EvalRuntimePrimitives extends Record<string, unknown> {
  provider: string;
  model: string;
  temperature?: number;
}

// 2. Generic parameter is the primitives object, not a single primitive.
export class EvalRuntime extends ValueObject<EvalRuntimePrimitives> {
  // 3. Constructor takes the inner Value Objects directly. Validation lives in
  //    each inner VO, so a composite often has no extra invariants of its own —
  //    but any cross-field rule would be enforced here.
  private constructor(
    private readonly provider: EvalProvider,
    private readonly model: EvalModel,
    private readonly temperature?: EvalTemperature,
  ) {
    super();
  }

  // 4. fromPrimitives() rehydrates every inner Value Object; optional fields
  //    are mapped explicitly.
  static fromPrimitives(primitives: EvalRuntimePrimitives): EvalRuntime {
    return new EvalRuntime(
      EvalProvider.fromPrimitives(primitives.provider),
      EvalModel.fromPrimitives(primitives.model),
      primitives.temperature !== undefined && primitives.temperature !== null
        ? EvalTemperature.fromPrimitives(primitives.temperature)
        : undefined,
    );
  }

  // 5. A semantic create() that accepts the already-built inner Value Objects.
  static create(input: {
    provider: EvalProvider;
    model: EvalModel;
    temperature?: EvalTemperature;
  }): EvalRuntime {
    return new EvalRuntime(input.provider, input.model, input.temperature);
  }

  // 6. toPrimitives() delegates to each inner Value Object's toPrimitives().
  toPrimitives(): EvalRuntimePrimitives {
    return {
      provider: this.provider.toPrimitives(),
      model: this.model.toPrimitives(),
      temperature: this.temperature ? this.temperature.toPrimitives() : undefined,
    };
  }

  // 7. Getters expose the inner Value Objects (never raw primitives).
  get providerValue(): EvalProvider {
    return this.provider;
  }

  get modelValue(): EvalModel {
    return this.model;
  }

  get temperatureValue(): EvalTemperature | undefined {
    return this.temperature;
  }
}
```

---

## 6. Testing a Value Object

Value Objects are pure, immutable, and self-validating, which makes them the simplest domain element to test — no mocks, no I/O, just construct and assert. Cover four things:

* **Round-trip**: `fromPrimitives(x).toPrimitives()` returns the normalized value (including trimming/casing the constructor applies).
* **Invariants**: invalid or empty input throws — one assertion per rejection rule.
* **Semantic constructors & checkers**: static factories (e.g. `evalStudio()`) produce the right value and `isX()` checkers answer correctly.
* **Nullable variants**: also cover the empty/`null` case (`empty()`, `fromPrimitives(null)`).

Drive everything through the public factories (never `new`), and assert on `toPrimitives()`. `npm run rules:check` requires a sibling `*.value-object.test.ts`.

For the full guide and reference example, see [How to Test a Value Object](how-to-test-a-value-object.md).
