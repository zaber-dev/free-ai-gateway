import fs from "fs";
import path from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { ProviderConfig } from "../types/contracts";

/**
 * Interface representing a source for provider configurations.
 * Allows decoupling provider data from disk files, enabling database,
 * remote API, or in-memory dynamic configuration loading.
 */
export interface IConfigurationSource {
  /**
   * Loads and returns validated provider configurations.
   */
  load(): { providers: ProviderConfig[] };
}

/**
 * Resolves configuration files across development (src/) and production (dist/) environments.
 */
function resolveConfigFile(filename: string): string {
  const candidatePaths = [
    path.resolve(__dirname, filename),
    path.resolve(__dirname, `../config/${filename}`),
    path.resolve(__dirname, `../../src/config/${filename}`),
    path.resolve(process.cwd(), `packages/core/src/config/${filename}`),
    path.resolve(process.cwd(), `src/config/${filename}`),
    path.resolve(process.cwd(), `config/${filename}`),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`[ConfigurationSource] File "${filename}" could not be located. Looked in: ${candidatePaths.join(", ")}`);
}

/**
 * Loads provider configurations from JSON files with strict JSON Schema validation.
 */
export class FileConfigurationSource implements IConfigurationSource {
  private customConfigPath?: string;
  private customSchemaPath?: string;

  constructor(configPath?: string, schemaPath?: string) {
    this.customConfigPath = configPath;
    this.customSchemaPath = schemaPath;
  }

  public load(): { providers: ProviderConfig[] } {
    const configPath = this.customConfigPath ?? resolveConfigFile("providers.json");
    const schemaPath = this.customSchemaPath ?? resolveConfigFile("providers.schema.json");

    const rawConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const rawSchema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

    const ajv = new Ajv({ strict: false, allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(rawSchema);
    const valid = validate(rawConfig);

    if (!valid) {
      console.error("[FileConfigurationSource] Schema validation failed for providers.json:");
      console.error(validate.errors);
      throw new Error(`Invalid providers.json configuration: ${JSON.stringify(validate.errors)}`);
    }

    return rawConfig as { providers: ProviderConfig[] };
  }
}

/**
 * In-memory configuration source, useful for testing and programmatic initialization.
 */
export class MemoryConfigurationSource implements IConfigurationSource {
  constructor(private config: { providers: ProviderConfig[] }) {}

  public load(): { providers: ProviderConfig[] } {
    return this.config;
  }

  public setConfig(config: { providers: ProviderConfig[] }): void {
    this.config = config;
  }
}
