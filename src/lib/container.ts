import { createEvalExecutionModule } from "@/backend/modules/eval-execution";
import { createEvalWorkspaceModule } from "@/backend/modules/eval-workspace";
import { InMemoryEventBus, NoOpTelemetry } from "@/backend/modules/shared";

const telemetry = new NoOpTelemetry();
const eventBus = new InMemoryEventBus(telemetry);

const config = {
  workspaceRoot: process.env.EVAL_STUDIO_WORKSPACE,
};

export const evalWorkspaceModule = createEvalWorkspaceModule(config);
export const evalExecutionModule = createEvalExecutionModule({
  ...config,
  eventBus,
});
