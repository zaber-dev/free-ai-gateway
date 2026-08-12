import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CircuitBreaker } from "../src/resilience/circuit-breaker";

describe("CircuitBreaker", () => {
  it("should start in a closed state", () => {
    const breaker = new CircuitBreaker();
    assert.equal(breaker.isOpen("groq"), false);
  });

  it("should open after 3 consecutive failures", () => {
    const breaker = new CircuitBreaker(3, 5000);
    breaker.recordFailure("groq");
    breaker.recordFailure("groq");
    assert.equal(breaker.isOpen("groq"), false);
    breaker.recordFailure("groq");
    assert.equal(breaker.isOpen("groq"), true);
  });

  it("should reset failures on success", () => {
    const breaker = new CircuitBreaker(3, 5000);
    breaker.recordFailure("groq");
    breaker.recordFailure("groq");
    breaker.recordSuccess("groq");
    assert.equal(breaker.isOpen("groq"), false);
  });
});
