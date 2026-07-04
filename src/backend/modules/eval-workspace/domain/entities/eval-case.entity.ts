import { AggregateRoot, Timestamp } from "@/backend/modules/shared";
import { SuiteId } from "../value-objects/suite-id.value-object";
import { CaseId } from "../value-objects/case-id.value-object";
import { CaseName } from "../value-objects/case-name.value-object";
import type {
  CapturedPromptPrimitives,
  JsonRecord,
  RuntimePrimitives,
} from "./eval-workspace.entity";

export interface EvalCasePrimitives extends JsonRecord {
  caseId: string;
  suiteId: string;
  name: string;
  note?: string;
  createdAt: string;
  createdBy?: JsonRecord;
  input?: JsonRecord;
  promptTemplate?: CapturedPromptPrimitives;
  promptVariables?: JsonRecord;
  renderedPrompt: CapturedPromptPrimitives;
  runtime?: RuntimePrimitives;
  /** New cases store free text; JsonRecord keeps existing workspaces readable. */
  expectedOutput?: string | JsonRecord;
  source?: JsonRecord;
}

export class EvalCase extends AggregateRoot {
  private constructor(
    private readonly caseIdValue: CaseId,
    private readonly suiteIdValue: SuiteId,
    private readonly nameValue: CaseName,
    private readonly createdAtValue: Timestamp,
    private readonly primitives: EvalCasePrimitives,
  ) {
    super();
  }

  static fromPrimitives(primitives: EvalCasePrimitives): EvalCase {
    return new EvalCase(
      CaseId.fromPrimitives(primitives.caseId),
      SuiteId.fromPrimitives(primitives.suiteId),
      CaseName.fromPrimitives(primitives.name),
      Timestamp.fromPrimitives(primitives.createdAt),
      primitives,
    );
  }

  get id(): CaseId {
    return this.caseIdValue;
  }

  get suiteId(): SuiteId {
    return this.suiteIdValue;
  }

  toPrimitives(): EvalCasePrimitives {
    const primitives = { ...this.primitives };
    delete primitives.actionId;
    return {
      ...primitives,
      caseId: this.caseIdValue.toPrimitives(),
      suiteId: this.suiteIdValue.toPrimitives(),
      name: this.nameValue.toPrimitives(),
      createdAt: this.createdAtValue.toPrimitives(),
    };
  }
}
