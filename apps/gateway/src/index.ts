/**
 * FreeAI Gateway HTTP Application
 *
 * @license MIT
 * @author Md. Mahedi Zaman Zaber <https://github.com/zaber-dev>
 */

export { createServer, startServer } from "./api/server";
export { RouteLoader } from "./api/routes/route-loader";
export { createCapabilityHandler, RouteDependencies } from "./api/routes/route-factory";
export { JobScheduler, ScheduledJob, runReverifyJob } from "./jobs";
export { toOpenAIChatResponse } from "./adapters/openai";

import { startServer } from "./api/server";

if (require.main === module || !module.parent) {
  startServer();
}
