import { Capability } from "../capabilities/capabilities";
import { ProviderAdapter, ProviderConfig, ProviderModel } from "../types/contracts";
import { ProviderLoader } from "./provider-loader";
import { IConfigurationSource, FileConfigurationSource } from "../config/config-source";

/**
 * Provider Registry managing active provider adapters and model capability lookups.
 * Decoupled from filesystem dependencies via IConfigurationSource.
 */
export class Registry {
  public adapters: ProviderAdapter[] = [];
  public providersConfig: { providers: ProviderConfig[] };

  constructor(configSource?: IConfigurationSource | string) {
    let source: IConfigurationSource;

    if (!configSource) {
      source = new FileConfigurationSource();
    } else if (typeof configSource === "string") {
      source = new FileConfigurationSource(configSource);
    } else {
      source = configSource;
    }

    this.providersConfig = source.load();

    // Auto-discover and instantiate adapters
    for (const cfg of this.providersConfig.providers) {
      const AdapterClass = ProviderLoader.get(cfg.id);
      if (!AdapterClass) {
        console.warn(`[Registry] No adapter discovered for provider "${cfg.id}" — skipping. Config entry ignored.`);
        continue;
      }
      this.adapters.push(new AdapterClass(cfg));
    }
  }

  /**
   * Registers an instantiated provider adapter manually into the registry.
   */
  public registerAdapter(adapter: ProviderAdapter): void {
    this.adapters.push(adapter);
  }

  /**
   * Retrieves an adapter by provider ID.
   */
  public getAdapter(providerId: string): ProviderAdapter | undefined {
    return this.adapters.find((a) => a.config.id === providerId);
  }

  /**
   * Returns all active provider adapters.
   */
  public getAllAdapters(): ProviderAdapter[] {
    return this.adapters;
  }

  /**
   * Returns all candidate provider-model pairs matching the requested capabilities.
   */
  public getCandidates(capabilities: Capability[]): { adapter: ProviderAdapter; model: ProviderModel }[] {
    const out: { adapter: ProviderAdapter; model: ProviderModel }[] = [];
    for (const adapter of this.adapters) {
      for (const model of adapter.config.models) {
        if (capabilities.every((c) => model.capabilities.includes(c))) {
          out.push({ adapter, model });
        }
      }
    }
    return out;
  }
}
