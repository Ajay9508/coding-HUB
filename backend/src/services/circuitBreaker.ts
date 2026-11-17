export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export class CircuitBreaker<T> {
  state: CircuitState = "CLOSED";
  private failures = 0;
  private openedAt = 0;

  constructor(
    private readonly action?: () => Promise<T>,
    private readonly failureThreshold = 3,
    private readonly recoveryMs = 30_000,
  ) {}

  async execute(action = this.action): Promise<T> {
    if (!action) throw new Error("Circuit breaker action is not configured.");
    if (this.state === "OPEN") {
      if (Date.now() - this.openedAt < this.recoveryMs) {
        throw Object.assign(new Error("External provider circuit is open."), {
          status: 503,
          code: "provider_circuit_open",
          expose: true,
        });
      }
      this.state = "HALF_OPEN";
    }
    try {
      const result = await action();
      this.failures = 0;
      this.state = "CLOSED";
      return result;
    } catch (error) {
      this.failures += 1;
      if (this.failures >= this.failureThreshold) {
        this.state = "OPEN";
        this.openedAt = Date.now();
      }
      throw error;
    }
  }
}
