import fs from "fs";
import path from "path";
import { BaseProvider } from "./base-provider";
import { ProviderConfig } from "../types/contracts";

export type ProviderConstructor = new (config: ProviderConfig) => BaseProvider;

/**
 * Dynamic autoloader for Provider classes.
 * Discovers any BaseProvider class in the providers folder automatically without manual registration.
 */
export class ProviderLoader {
  private static registry = new Map<string, ProviderConstructor>();
  private static initialized = false;

  /**
   * Manually register a provider adapter class with a specific provider ID.
   */
  public static register(providerId: string, adapterClass: ProviderConstructor): void {
    this.registry.set(providerId, adapterClass);
  }

  /**
   * Retrieves an adapter class for the given provider ID.
   */
  public static get(providerId: string): ProviderConstructor | undefined {
    if (!this.initialized) {
      this.autoDiscover();
    }
    return this.registry.get(providerId);
  }

  /**
   * Returns all discovered provider constructors mapped by their provider ID.
   */
  public static getAll(): Map<string, ProviderConstructor> {
    if (!this.initialized) {
      this.autoDiscover();
    }
    return new Map(this.registry);
  }

  /**
   * Auto-discovers all provider classes residing in this directory.
   */
  public static autoDiscover(): void {
    if (this.initialized) return;

    const candidateDirs = [
      path.resolve(__dirname),
      path.resolve(__dirname, "../../src/providers"),
      path.resolve(process.cwd(), "packages/core/src/providers"),
      path.resolve(process.cwd(), "src/providers"),
      path.resolve(process.cwd(), "dist/providers"),
    ];

    let targetDir: string | undefined;
    for (const dir of candidateDirs) {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        targetDir = dir;
        break;
      }
    }

    if (targetDir) {
      const files = fs.readdirSync(targetDir).filter((file) => {
        const isCode = file.endsWith(".ts") || file.endsWith(".js");
        const isIgnored =
          file.startsWith("index.") ||
          file.startsWith("base-provider.") ||
          file.startsWith("provider-") ||
          file.startsWith("registry.") ||
          file.endsWith(".d.ts") ||
          file.endsWith(".test.ts");
        return isCode && !isIgnored;
      });

      for (const file of files) {
        try {
          const fullPath = path.join(targetDir, file);
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const mod = require(fullPath);

          for (const key of Object.keys(mod)) {
            const exported = mod[key];
            if (
              typeof exported === "function" &&
              exported.prototype instanceof BaseProvider &&
              typeof exported.providerId === "string"
            ) {
              this.register(exported.providerId, exported);
            }
          }
        } catch (err) {
          console.warn(`[ProviderLoader] Failed to autoload provider from "${file}":`, err);
        }
      }
    }

    this.initialized = true;
  }
}
