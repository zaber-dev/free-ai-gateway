import fs from "fs";
import path from "path";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { RouteDependencies } from "./route-factory";

export type RoutePlugin = FastifyPluginAsync<RouteDependencies> | ((fastify: FastifyInstance, opts: any) => Promise<void>);

/**
 * RouteLoader manages dynamic discovery and registration of Fastify API routes.
 * Completely open for developer customization and extension.
 */
export class RouteLoader {
  private static registeredPlugins = new Set<RoutePlugin>();

  /**
   * Registers a custom route plugin manually into the registry.
   */
  public static registerPlugin(plugin: RoutePlugin): void {
    this.registeredPlugins.add(plugin);
  }

  /**
   * Automatically discovers and registers all route modules from the routes directory.
   */
  public static registerAll(server: FastifyInstance, options: RouteDependencies, customDir?: string): void {
    const candidateDirs = [
      customDir,
      path.resolve(__dirname),
      path.resolve(__dirname, "../../src/api/routes"),
      path.resolve(process.cwd(), "apps/gateway/src/api/routes"),
      path.resolve(process.cwd(), "src/api/routes"),
      path.resolve(process.cwd(), "dist/api/routes"),
    ].filter(Boolean) as string[];

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
          file.startsWith("route-") ||
          file.endsWith(".d.ts") ||
          file.endsWith(".test.ts");
        return isCode && !isIgnored;
      });

      for (const file of files) {
        try {
          const fullPath = path.join(targetDir, file);
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const mod = require(fullPath);
          const routeHandler = mod.default || mod;

          if (typeof routeHandler === "function") {
            server.register(routeHandler, options);
          }
        } catch (err) {
          console.warn(`[RouteLoader] Failed to autoload route module "${file}":`, err);
        }
      }
    }

    // Register any programmatically registered custom plugins
    for (const plugin of this.registeredPlugins) {
      server.register(plugin, options);
    }
  }
}
