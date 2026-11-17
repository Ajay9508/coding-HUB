export class CircuitBreaker {
    action;
    failureThreshold;
    recoveryMs;
    state = "CLOSED";
    failures = 0;
    openedAt = 0;
    constructor(action, failureThreshold = 3, recoveryMs = 30_000) {
        this.action = action;
        this.failureThreshold = failureThreshold;
        this.recoveryMs = recoveryMs;
    }
    async execute(action = this.action) {
        if (!action)
            throw new Error("Circuit breaker action is not configured.");
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
        }
        catch (error) {
            this.failures += 1;
            if (this.failures >= this.failureThreshold) {
                this.state = "OPEN";
                this.openedAt = Date.now();
            }
            throw error;
        }
    }
}
