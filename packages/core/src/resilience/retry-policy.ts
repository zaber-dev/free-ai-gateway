import { RetryPolicy } from "../types/contracts";

export interface RetryRuntime {
  random: () => number;
  sleep: (ms: number) => Promise<void>;
}

export const defaultRetryRuntime: RetryRuntime = {
  random: () => Math.random(),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

export function normalizeRetryCount(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.floor(value));
}

function normalizedDelay(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.max(0, value);
}

export function initialRetryDelay(policy: RetryPolicy): number {
  const maxDelayMs = normalizedDelay(policy.maxDelayMs, 5000);
  return Math.min(normalizedDelay(policy.baseDelayMs, 1000), maxDelayMs);
}

export function retryDelay(
  attempt: number,
  previousDelayMs: number,
  policy: RetryPolicy,
  random: () => number
): number {
  const maxDelayMs = normalizedDelay(policy.maxDelayMs, 5000);
  const baseDelayMs = Math.min(normalizedDelay(policy.baseDelayMs, 1000), maxDelayMs);
  const sample = Math.min(1, Math.max(0, random()));

  if ((policy.jitter ?? "full") === "decorrelated") {
    const upper = Math.max(baseDelayMs, previousDelayMs * 3);
    return Math.min(baseDelayMs + sample * (upper - baseDelayMs), maxDelayMs);
  }

  const cap = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
  return sample * cap;
}
