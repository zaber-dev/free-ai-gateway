import { EventEmitter } from "events";
import { Capability } from "../capabilities/capabilities";

export interface GatewayEventMap {
  "request:start": {
    requestId: string;
    capabilities: Capability[];
    preferredProvider?: string;
    preferredModel?: string;
  };
  "request:success": {
    requestId: string;
    providerId: string;
    modelId: string;
    latencyMs: number;
  };
  "request:fallback": {
    requestId: string;
    attemptedProvider: string;
    attemptedModel: string;
    error: string;
  };
  "provider:rate_limited": {
    providerId: string;
    modelId: string;
    retryAfterMs?: number;
  };
  "circuit:opened": {
    providerId: string;
    consecutiveFailures: number;
    backoffMs: number;
  };
  "circuit:closed": {
    providerId: string;
  };
}

/**
 * Enterprise typed Event Bus for gateway observability, telemetry, and auditing.
 */
export class EventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  public emit<K extends keyof GatewayEventMap>(event: K, data: GatewayEventMap[K]): boolean {
    return this.emitter.emit(event, data);
  }

  public on<K extends keyof GatewayEventMap>(
    event: K,
    listener: (data: GatewayEventMap[K]) => void
  ): this {
    this.emitter.on(event, listener);
    return this;
  }

  public once<K extends keyof GatewayEventMap>(
    event: K,
    listener: (data: GatewayEventMap[K]) => void
  ): this {
    this.emitter.once(event, listener);
    return this;
  }

  public off<K extends keyof GatewayEventMap>(
    event: K,
    listener: (data: GatewayEventMap[K]) => void
  ): this {
    this.emitter.off(event, listener);
    return this;
  }

  public removeAllListeners(): this {
    this.emitter.removeAllListeners();
    return this;
  }
}
