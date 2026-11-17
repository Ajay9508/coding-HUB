import test from "node:test";
import assert from "node:assert/strict";

const { CircuitBreaker } = await import("../dist/services/circuitBreaker.js");

test("circuit breaker transitions CLOSED, OPEN, and HALF_OPEN", async () => {
  let shouldFail = true;
  const breaker = new CircuitBreaker(async () => {
    if (shouldFail) throw new Error("provider unavailable");
    return "ok";
  }, 2, 10);

  await assert.rejects(() => breaker.execute());
  await assert.rejects(() => breaker.execute());
  assert.equal(breaker.state, "OPEN");
  await assert.rejects(() => breaker.execute(), { code: "provider_circuit_open" });
  await new Promise((resolve) => setTimeout(resolve, 15));
  shouldFail = false;
  assert.equal(await breaker.execute(), "ok");
  assert.equal(breaker.state, "CLOSED");
});
