import fs from "fs";
import path from "path";
import { LimitScope, RateLimitSpec } from "../types/contracts";

export interface QuotaBucket {
  requestsThisMinute: number;
  minuteTimestamp: number;
  requestsToday: number;
  dayTimestamp: number;
  exhaustedUntil?: number;
}

/**
 * Sliding-window quota tracker with proactive RPM/RPD checking, multi-key isolation, and state snapshotting.
 */
export class QuotaTracker {
  private buckets = new Map<string, QuotaBucket>();
  private snapshotFile: string;

  constructor(snapshotFile = "./state/quota-snapshot.json") {
    this.snapshotFile = snapshotFile;
    this.loadSnapshot();
  }

  private getKey(providerId: string, modelId: string, scope: LimitScope, apiKey?: string): string {
    const keyPrefix = apiKey ? `${providerId}:key_${apiKey.slice(-6)}` : providerId;
    return scope === "per_model" ? `${keyPrefix}:${modelId}` : keyPrefix;
  }

  private getBucket(key: string): QuotaBucket {
    const now = Date.now();
    const currentMinute = Math.floor(now / 60_000);
    const currentDay = Math.floor(now / 86_400_000);

    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        requestsThisMinute: 0,
        minuteTimestamp: currentMinute,
        requestsToday: 0,
        dayTimestamp: currentDay,
      };
      this.buckets.set(key, bucket);
      return bucket;
    }

    if (bucket.minuteTimestamp !== currentMinute) {
      bucket.requestsThisMinute = 0;
      bucket.minuteTimestamp = currentMinute;
    }

    if (bucket.dayTimestamp !== currentDay) {
      bucket.requestsToday = 0;
      bucket.dayTimestamp = currentDay;
    }

    return bucket;
  }

  public canProceed(
    providerId: string,
    modelId: string,
    scope: LimitScope,
    limits?: RateLimitSpec,
    apiKey?: string
  ): boolean {
    const key = this.getKey(providerId, modelId, scope, apiKey);
    const bucket = this.getBucket(key);

    if (bucket.exhaustedUntil && Date.now() < bucket.exhaustedUntil) {
      return false;
    }

    if (limits?.rpm && bucket.requestsThisMinute >= limits.rpm) {
      return false;
    }

    if (limits?.rpd && bucket.requestsToday >= limits.rpd) {
      return false;
    }

    return true;
  }

  public recordUsage(
    providerId: string,
    modelId: string,
    scope: LimitScope,
    apiKey?: string
  ): void {
    const key = this.getKey(providerId, modelId, scope, apiKey);
    const bucket = this.getBucket(key);
    bucket.requestsThisMinute += 1;
    bucket.requestsToday += 1;
  }

  public markExhausted(
    providerId: string,
    modelId: string,
    scope: LimitScope,
    retryAfterMs = 60_000,
    apiKey?: string
  ): void {
    const key = this.getKey(providerId, modelId, scope, apiKey);
    const bucket = this.getBucket(key);
    bucket.exhaustedUntil = Date.now() + retryAfterMs;
  }

  public reset(): void {
    this.buckets.clear();
  }

  public saveSnapshot(): void {
    try {
      const dir = path.dirname(this.snapshotFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data: Record<string, QuotaBucket> = {};
      for (const [k, v] of this.buckets.entries()) {
        data[k] = v;
      }
      fs.writeFileSync(this.snapshotFile, JSON.stringify(data, null, 2));
    } catch {
      // Best-effort snapshot save
    }
  }

  private loadSnapshot(): void {
    try {
      if (fs.existsSync(this.snapshotFile)) {
        const raw = fs.readFileSync(this.snapshotFile, "utf-8");
        const data = JSON.parse(raw);
        for (const [k, v] of Object.entries(data)) {
          this.buckets.set(k, v as QuotaBucket);
        }
      }
    } catch {
      // Ignored if snapshot is unreadable
    }
  }
}
