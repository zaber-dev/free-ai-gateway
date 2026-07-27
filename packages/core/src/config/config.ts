import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  env: string;
  defaultTimeoutMs: number;
}

/**
 * Centralized environment configuration helper for core.
 */
export class Config {
  private static cachedConfig: AppConfig | null = null;

  public static get(): AppConfig {
    if (!this.cachedConfig) {
      this.cachedConfig = {
        env: process.env.NODE_ENV || "development",
        defaultTimeoutMs: parseInt(process.env.DEFAULT_TIMEOUT_MS || "30000", 10),
      };
    }
    return this.cachedConfig;
  }

  public static isProduction(): boolean {
    return this.get().env === "production";
  }

  public static isTest(): boolean {
    return this.get().env === "test";
  }
}
