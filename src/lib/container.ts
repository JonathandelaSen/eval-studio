import { createEvalExecutionModule } from "@/backend/modules/eval-execution";
import { createEvalWorkspaceModule } from "@/backend/modules/eval-workspace";

const config = {
  workspaceRoot: process.env.EVAL_STUDIO_WORKSPACE,
};

export const evalWorkspaceModule = createEvalWorkspaceModule(config);
export const evalExecutionModule = createEvalExecutionModule(config);
