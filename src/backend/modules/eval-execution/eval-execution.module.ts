import { CreatePromptReplayRunUseCase } from "./application/use-cases/create-prompt-replay-run.use-case";
import { FilesystemEvalRunRepository } from "./infrastructure/repositories/filesystem-eval-run.repository";
import { MockEvalProviderRepository } from "./infrastructure/repositories/mock-eval-provider.repository";

export function createEvalExecutionModule(config: { workspaceRoot?: string }) {
  const runRepository = new FilesystemEvalRunRepository(config.workspaceRoot);
  const providerRepository = new MockEvalProviderRepository();

  return {
    createPromptReplayRun: new CreatePromptReplayRunUseCase({
      providerRepository,
      runRepository,
    }),
  };
}
