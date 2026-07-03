import os from "node:os";
import path from "node:path";
import { createEvalExecutionModule } from "@/backend/modules/eval-execution";
import { createEvalWorkspaceModule } from "@/backend/modules/eval-workspace";
import { createProjectModule } from "@/backend/modules/project";
import { InMemoryEventBus, NoOpTelemetry } from "@/backend/modules/shared";

const settingsFile =
  process.env.EVAL_STUDIO_SETTINGS_FILE ??
  path.join(os.homedir(), ".eval-studio", "projects.json");
const eventBus = new InMemoryEventBus(new NoOpTelemetry());

export const projectModule = createProjectModule({
  settingsFile,
  homeDirectory: os.homedir(),
  eventBus,
});

export const evalWorkspaceModule = createEvalWorkspaceModule();
export const evalExecutionModule = createEvalExecutionModule({ eventBus });
