export interface CircuitState {
  failures: number;
  lastFailure: number;
  openUntil: number;
}

/**
 * Enterprise Circuit Breaker with exponential backoff to isolate failing upstream providers.
 */
export class CircuitBreaker {
  private circuits = new Map<string, CircuitState>();

  constructor(
    private threshold = 3,
    private baseCooldownMs = 10_000,
    private maxCooldownMs = 300_000
  ) {}

  isOpen(providerId: string): boolean {
    const state = this.circuits.get(providerId);
    if (!state) return false;
    if (Date.now() < state.openUntil) return true;
    return false;
  }

  recordSuccess(providerId: string) {
    this.circuits.delete(providerId);
  }

  recordFailure(providerId: string) {
    const now = Date.now();
    const state = this.circuits.get(providerId) || { failures: 0, lastFailure: 0, openUntil: 0 };
    state.failures += 1;
    state.lastFailure = now;

    if (state.failures >= this.threshold) {
      const exponent = state.failures - this.threshold;
      const cooldown = Math.min(this.baseCooldownMs * Math.pow(2, exponent), this.maxCooldownMs);
      state.openUntil = now + cooldown;
    }

    this.circuits.set(providerId, state);
  }

  getStatus(providerId: string): { isOpen: boolean; openUntil: number; failures: number } {
    const state = this.circuits.get(providerId);
    if (!state) return { isOpen: false, openUntil: 0, failures: 0 };
    return {
      isOpen: Date.now() < state.openUntil,
      openUntil: state.openUntil,
      failures: state.failures,
    };
  }
}
