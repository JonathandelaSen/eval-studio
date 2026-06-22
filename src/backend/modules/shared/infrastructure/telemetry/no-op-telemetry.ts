/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  Telemetry,
  TelemetryCaptureOptions,
  TelemetryLogOptions,
  TelemetrySpanOptions,
  TelemetryUser,
} from "../../application/telemetry/telemetry";

export class NoOpTelemetry implements Telemetry {
  trace<T>(
    _options: TelemetrySpanOptions,
    operation: () => Promise<T>,
  ): Promise<T> {
    return operation();
  }

  log(_options: TelemetryLogOptions): void {}

  captureException(_error: unknown, _options?: TelemetryCaptureOptions): void {}

  setUser(_user: TelemetryUser | null): void {}
}
