import type {
  EvalProviderExecutionInput,
  EvalProviderRepository,
} from "../../domain/repositories/eval-provider.repository";
import type { EvalPromptExecution } from "../../domain/entities/eval-prompt-execution.entity";

export class ProviderRouterRepository implements EvalProviderRepository {
  constructor(
    private readonly providers: {
      mock: EvalProviderRepository;
      ollama: EvalProviderRepository;
      apple: EvalProviderRepository;
    },
  ) {}

  execute(input: EvalProviderExecutionInput): Promise<EvalPromptExecution> {
    if (input.provider.isMock()) return this.providers.mock.execute(input);
    if (input.provider.isOllama()) return this.providers.ollama.execute(input);
    if (input.provider.isApple()) return this.providers.apple.execute(input);
    throw new Error(`Provider ${input.provider.toPrimitives()} is not configured.`);
  }
}
