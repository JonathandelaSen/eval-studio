import { CreateRunUseCase } from "./application/use-cases/create-run.use-case";
import { FilesystemEvalRunRepository } from "./infrastructure/repositories/filesystem-eval-run.repository";
import { FilesystemEvalResultRepository } from "./infrastructure/repositories/filesystem-eval-result.repository";
import { MockEvalProviderRepository } from "./infrastructure/repositories/mock-eval-provider.repository";
import type { EventBus } from "@/backend/modules/shared";

export function createEvalExecutionModule(config: { workspaceRoot?: string; eventBus: EventBus }) {
  const runRepository = new FilesystemEvalRunRepository(config.workspaceRoot);
  const resultRepository = new FilesystemEvalResultRepository(config.workspaceRoot);
  const providerRepository = new MockEvalProviderRepository();

  return {
    createRun: new CreateRunUseCase({
      providerRepository,
      runRepository,
      resultRepository,
      eventBus: config.eventBus,
    }),
  };
}
