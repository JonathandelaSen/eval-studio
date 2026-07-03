import { AggregateRoot, Timestamp } from "@/backend/modules/shared";
import { ActionId } from "../value-objects/action-id.value-object";
import { CaseId } from "../value-objects/case-id.value-object";
import { CaseName } from "../value-objects/case-name.value-object";
import type {
  CapturedPromptPrimitives,
  JsonRecord,
  RuntimePrimitives,
} from "./eval-workspace.entity";

export interface EvalCasePrimitives extends JsonRecord {
  caseId: string;
  actionId: string;
  name: string;
  note?: string;
  createdAt: string;
  createdBy?: JsonRecord;
  input?: JsonRecord;
  promptTemplate?: CapturedPromptPrimitives;
  promptVariables?: JsonRecord;
  renderedPrompt: CapturedPromptPrimitives;
  runtime?: RuntimePrimitives;
  expectedOutput?: JsonRecord;
  source?: JsonRecord;
}

export class EvalCase extends AggregateRoot {
  private constructor(
    private readonly caseIdValue: CaseId,
    private readonly actionIdValue: ActionId,
    private readonly nameValue: CaseName,
    private readonly createdAtValue: Timestamp,
    private readonly primitives: EvalCasePrimitives,
  ) {
    super();
  }

  static fromPrimitives(primitives: EvalCasePrimitives): EvalCase {
    return new EvalCase(
      CaseId.fromPrimitives(primitives.caseId),
      ActionId.fromPrimitives(primitives.actionId),
      CaseName.fromPrimitives(primitives.name),
      Timestamp.fromPrimitives(primitives.createdAt),
      primitives,
    );
  }

  get id(): CaseId {
    return this.caseIdValue;
  }

  toPrimitives(): EvalCasePrimitives {
    return {
      ...this.primitives,
      caseId: this.caseIdValue.toPrimitives(),
      actionId: this.actionIdValue.toPrimitives(),
      name: this.nameValue.toPrimitives(),
      createdAt: this.createdAtValue.toPrimitives(),
    };
  }
}
