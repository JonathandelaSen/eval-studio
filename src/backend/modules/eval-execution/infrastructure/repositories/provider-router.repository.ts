import type {
  EvalProviderExecutionInput,
  EvalProviderRepository,
} from "../../domain/repositories/eval-provider.repository";
import type { EvalPromptExecution } from "../../domain/entities/eval-prompt-execution.entity";
import { EvalProviderRequest } from "../../domain/value-objects/eval-provider-request.value-object";

export class ProviderRouterRepository implements EvalProviderRepository {
  constructor(
    private readonly providers: {
      mock: EvalProviderRepository;
      ollama: EvalProviderRepository;
      apple: EvalProviderRepository;
    },
  ) {}

  prepare(input: EvalProviderExecutionInput): EvalProviderRequest {
    return this.provider(input).prepare(input);
  }

  execute(
    input: EvalProviderExecutionInput,
    request?: EvalProviderRequest,
  ): Promise<EvalPromptExecution> {
    return this.provider(input).execute(input, request);
  }

  private provider(input: EvalProviderExecutionInput): EvalProviderRepository {
    if (input.provider.isMock()) return this.providers.mock;
    if (input.provider.isOllama()) return this.providers.ollama;
    if (input.provider.isApple()) return this.providers.apple;
    throw new Error(`Provider ${input.provider.toPrimitives()} is not configured.`);
  }
}
