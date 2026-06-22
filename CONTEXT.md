# Eval Studio

Eval Studio is a local evaluation workspace for reviewing, scoring, comparing, and running repeatable evaluations of AI-backed product behavior.

## Language

**Action**:
An AI-backed product behavior that can be evaluated through cases, runs, results, and annotations.
_Avoid_: Evaluation target, prompt

**Case**:
A reproducible, executable situation for one **Action**.
_Avoid_: Sample, fixture, review item

**Suite**:
A named set of **Cases** for one **Action**.
_Avoid_: Action, folder

**Run**:
One experiment execution over one or more **Cases** from the same **Action**.
_Avoid_: Batch, session, job

**Baseline Run**:
A **Run** used as a reference for comparison.
_Avoid_: Baseline entity, golden set

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

- An **Action** has one or more **Cases**
- An **Action** has one or more **Suites**
- A **Case** belongs to exactly one **Action**
- A **Suite** belongs to exactly one **Action**
- A **Suite** contains one or more **Cases**
- A **Run** belongs to exactly one **Action**
- A **Run** includes one or more **Cases**
- A **Run** can originate from one **Suite**
- A **Baseline Run** is a **Run**
- A **Producer** can create **Cases**, **Runs**, and **Results**
- A **Result** belongs to exactly one **Run**
- A **Result** belongs to exactly one **Case**
- An **Annotation** belongs to exactly one **Result**
- An **Annotation** has exactly one **Score**

## Example dialogue

> **Dev:** "Should we evaluate a prompt file directly?"
> **Domain expert:** "No. We evaluate the **Action**, because behavior depends on the prompt, inputs, runtime, output contract, and post-processing."
> **Dev:** "Can we save a half-captured example as a **Case**?"
> **Domain expert:** "Not in the MVP. A **Case** must be executable by Eval Studio."
> **Dev:** "Is a **Suite** the same thing as an **Action**?"
> **Domain expert:** "No. A **Suite** is a named set of **Cases** for an **Action**."
> **Dev:** "Can one **Run** include cases from unrelated **Actions**?"
> **Domain expert:** "No. A **Run** belongs to one **Action** so its results can be compared coherently."
> **Dev:** "If a **Suite** changes after execution, does the **Run** change?"
> **Domain expert:** "No. A **Run** records the **Cases** it actually executed."
> **Dev:** "Is a baseline a separate object?"
> **Domain expert:** "No. A **Baseline Run** is a **Run** used as a reference."
> **Dev:** "How do we know whether a result came from Eval Studio or another app?"
> **Domain expert:** "The **Producer** names the app or tool that created it."
> **Dev:** "If provider execution fails, do we still have a **Result**?"
> **Domain expert:** "Yes. Failed execution is still the outcome of that **Case** in that **Run**."
> **Dev:** "Do we score a **Case** or a **Result**?"
> **Domain expert:** "We score the **Result**, because the same **Case** can produce different outcomes across **Runs**."
> **Dev:** "Can we save only tags as an **Annotation**?"
> **Domain expert:** "No. An **Annotation** starts with a human score; comments and tags are optional context."
> **Dev:** "Is the **Score** relative to the baseline?"
> **Domain expert:** "No. The **Score** is absolute; relative improvement is derived by comparing scores."

## Flagged ambiguities

- "evaluation target" was considered as a name for **Action**; resolved: **Action** is the canonical term.
- "case" was narrowed to mean an executable evaluation situation; non-executable captured material is incomplete input, not a valid **Case**.
- "suite" is not an alias for **Action**; it is a named subset of **Cases** within one **Action**.
- "run" was narrowed to one **Action**; multi-action batches are not part of the MVP language.
- "run from suite" records the executed **Cases**; the **Suite** is only the origin.
- "baseline" is a role a **Run** can play, not a separate entity.
- "producer" is domain language for artifact authorship; it is not the same as source context inside a **Case**.
- "result" includes failed outcomes; it does not require valid model output.
- "annotation" is attached to a **Result**, not directly to a **Case** or **Run**.
- "annotation" requires a human score; comment-only or tag-only notes are not **Annotations** in the MVP.
- "score" means absolute result quality, not improvement relative to another **Run**.
