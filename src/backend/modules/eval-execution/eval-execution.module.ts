import { CreateRunUseCase } from "./application/use-cases/create-run.use-case";
import { ExecuteRunUseCase } from "./application/use-cases/execute-run.use-case";
import { ListProvidersUseCase } from "./application/use-cases/list-providers.use-case";
import { UpdateRunUseCase } from "./application/use-cases/update-run.use-case";
import { DeleteRunUseCase } from "./application/use-cases/delete-run.use-case";
import { FilesystemEvalRunRepository } from "./infrastructure/repositories/filesystem-eval-run.repository";
import { FilesystemEvalResultRepository } from "./infrastructure/repositories/filesystem-eval-result.repository";
import { MockEvalProviderRepository } from "./infrastructure/repositories/mock-eval-provider.repository";
import { OllamaEvalProviderRepository } from "./infrastructure/repositories/ollama-eval-provider.repository";
import { AppleEvalProviderRepository } from "./infrastructure/repositories/apple-eval-provider.repository";
import { ProviderRouterRepository } from "./infrastructure/repositories/provider-router.repository";
import { LocalEvalProviderCatalogRepository } from "./infrastructure/repositories/local-eval-provider-catalog.repository";
import type { EventBus } from "@/backend/modules/shared";

export function createEvalExecutionModule(config: { eventBus: EventBus }) {
  const runRepository = new FilesystemEvalRunRepository();
  const resultRepository = new FilesystemEvalResultRepository();
  const mock = new MockEvalProviderRepository();
  const ollama = new OllamaEvalProviderRepository();
  const apple = new AppleEvalProviderRepository();
  const providerRepository = new ProviderRouterRepository({ mock, ollama, apple });
  const catalogRepository = new LocalEvalProviderCatalogRepository({ ollama, apple });

  return {
    createRun: new CreateRunUseCase({
      runRepository,
      eventBus: config.eventBus,
    }),
    executeRun: new ExecuteRunUseCase({
      providerRepository,
      runRepository,
      resultRepository,
      eventBus: config.eventBus,
    }),
    listProviders: new ListProvidersUseCase({ catalogRepository }),
    interruptRun: async (workspaceRoot: string | undefined, run: import("./domain/entities/eval-run.entity").EvalRun) => {
      run.markInterrupted();
      const root = workspaceRoot
        ? (await import("./domain/value-objects/workspace-root.value-object")).WorkspaceRoot.fromPrimitives(workspaceRoot)
        : undefined;
      await runRepository.save(root, run);
    },
    updateRun: new UpdateRunUseCase({ runRepository }),
    deleteRun: new DeleteRunUseCase({ runRepository }),
  };
}
