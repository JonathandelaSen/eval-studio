import { ValueObject } from "@/backend/modules/shared";

export class ProjectActive extends ValueObject<boolean> {
  private constructor(private readonly value: boolean) {
    super();
  }

  static fromPrimitives(value: boolean): ProjectActive {
    return new ProjectActive(value);
  }

  static inactive(): ProjectActive {
    return new ProjectActive(false);
  }

  toPrimitives(): boolean {
    return this.value;
  }
}
