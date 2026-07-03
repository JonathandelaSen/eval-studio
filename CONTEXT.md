# Eval Studio

Eval Studio is a local evaluation workspace for reviewing, scoring, comparing, and running repeatable evaluations of AI-backed product behavior.

## Bounded Contexts

**Execution** (`eval-execution`):
Executing **Runs** and capturing their **Results**. Owns **Run**, **Result**, and the machinery that runs a **Case** against an AI provider.

**Workspace** (`eval-workspace`):
Defining and reviewing the artifacts of evaluation. Owns **Case**, **Suite**, **Annotation**, and the workspace snapshot.

A bounded context is named for the capability it covers, not for a single entity it contains.

## Language

**Case**:
A reproducible, executable evaluation situation.
_Avoid_: Sample, fixture, review item

**Suite**:
A named evaluation scope that owns its **Cases**.
_Avoid_: Action, folder, case group

**Run**:
A persisted experiment execution over all or a subset of the **Cases** in one **Suite**.
_Avoid_: Batch, session, job

**Runtime**:
The provider, model identity, and generation settings requested or used for evaluation execution.
_Avoid_: Environment, engine

**Baseline Run**:
A **Run** used as a reference for comparison.
_Avoid_: Baseline entity, golden set

**Interrupted Run**:
A **Run** that stopped before every selected **Case** produced a **Result**.
_Avoid_: Failed Run, paused Run

**Producer**:
The app or tool that created a **Case**, **Run**, or **Result**.
_Avoid_: Source app, origin

**Result**:
The completed or failed outcome for one **Case** inside one **Run**.
_Avoid_: Output, response

**Annotation**:
A human score, with optional comment and tags, attached to one **Result**.
_Avoid_: Verdict, review

**Score**:
An absolute human judgment of result quality on a zero-to-five scale.
_Avoid_: Delta, rating relative to baseline

## Relationships

- A **Suite** contains zero or more **Cases**
- A **Case** belongs to exactly one **Suite**
- A **Run** belongs to exactly one **Suite**
- A **Run** includes one or more **Cases** from its **Suite**
- A **Run** requests one **Runtime**
- A **Result** records the effective **Runtime** that produced it
- A **Baseline Run** is a **Run**
- An **Interrupted Run** preserves its completed **Results**
- A **Producer** can create **Cases**, **Runs**, and **Results**
- A **Result** belongs to exactly one **Run**
- A **Result** belongs to exactly one **Case**
- Each **Case** selected for a **Run** produces exactly one successful or failed **Result**
- An **Annotation** belongs to exactly one **Result**
- An **Annotation** has exactly one **Score**

## Example dialogue

> **Dev:** "Can we save a half-captured example as a **Case**?"
> **Domain expert:** "Not in the MVP. A **Case** must be executable by Eval Studio."
> **Dev:** "Can the same **Case** belong to two **Suites**?"
> **Domain expert:** "No. A **Case** belongs to exactly one **Suite**; reuse requires creating another **Case**."
> **Dev:** "Can I create a **Suite** before it has any Cases?"
> **Domain expert:** "Yes. An empty **Suite** is valid, but it cannot produce a **Run**."
> **Dev:** "If I edit a **Case** after running it, do its old Results change?"
> **Domain expert:** "No. The **Case** can evolve, while each **Result** preserves the exact prompt it executed."
> **Dev:** "Can one **Run** include Cases from different **Suites**?"
> **Domain expert:** "No. A **Run** belongs to one **Suite** and executes all or a subset of its **Cases**."
> **Dev:** "If a **Suite** changes after execution, does the **Run** change?"
> **Domain expert:** "No. A **Run** records the **Cases** it actually executed."
> **Dev:** "If an Ollama tag or Apple system model changes later, does an old **Result** point to the new model?"
> **Domain expert:** "No. Each **Result** records the effective **Runtime** that produced it."
> **Dev:** "Is a baseline a separate object?"
> **Domain expert:** "No. A **Baseline Run** is a **Run** used as a reference."
> **Dev:** "How do we know whether a result came from Eval Studio or another app?"
> **Domain expert:** "The **Producer** names the app or tool that created it."
> **Dev:** "If provider execution fails, do we still have a **Result**?"
> **Domain expert:** "Yes. Failed execution is still the outcome of that **Case** in that **Run**."
> **Dev:** "Does one failed **Result** stop the rest of the **Run**?"
> **Domain expert:** "No. Every selected **Case** is attempted independently."
> **Dev:** "Does leaving the Run screen stop its execution?"
> **Domain expert:** "No. A **Run** continues independently and persists Results as they complete."
> **Dev:** "Does reopening Eval Studio automatically resume an **Interrupted Run**?"
> **Domain expert:** "No. Its completed Results remain, and retrying missing Cases creates a new **Run**."
> **Dev:** "Do we score a **Case** or a **Result**?"
> **Domain expert:** "We score the **Result**, because the same **Case** can produce different outcomes across **Runs**."
> **Dev:** "Can we save only tags as an **Annotation**?"
> **Domain expert:** "No. An **Annotation** starts with a human score; comments and tags are optional context."
> **Dev:** "Is the **Score** relative to the baseline?"
> **Domain expert:** "No. The **Score** is absolute; relative improvement is derived by comparing scores."

## Flagged ambiguities

- "case" was narrowed to mean an executable evaluation situation; non-executable captured material is incomplete input, not a valid **Case**.
- A **Case** belongs to exactly one **Suite**; Cases are not shared across Suites.
- A **Suite** can be empty; a **Run** still requires at least one **Case**.
- Editing a **Case** affects future Runs only; existing Results remain historical evidence.
- "action" was removed from the domain language; **Suite** is the visible evaluation scope that groups **Cases** and owns **Runs**.
- "run" was narrowed to one **Suite**; cross-suite runs are not part of the MVP language.
- A **Run** continues independently of the screen that started it and persists Results incrementally.
- A **Run** records the executed **Cases**, so later changes to its **Suite** do not alter its history.
- A requested model name may resolve differently over time; each **Result** records its effective **Runtime** for auditability.
- "baseline" is a role a **Run** can play, not a separate entity.
- An interrupted execution is not resumed automatically; retrying its missing Cases creates a new **Run**.
- "producer" is domain language for artifact authorship; it is not the same as source context inside a **Case**.
- "result" includes failed outcomes; it does not require valid model output.
- One failed **Result** does not prevent the remaining Cases in its **Run** from executing.
- "annotation" is attached to a **Result**, not directly to a **Case** or **Run**.
- "annotation" requires a human score; comment-only or tag-only notes are not **Annotations** in the MVP.
- "score" means absolute result quality, not improvement relative to another **Run**.
