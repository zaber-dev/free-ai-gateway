/**
 * @free-ai-gateway/cli
 * Developer CLI tool for Free-AI Gateway: interactive terminal AI, provider diagnostics, and model querying.
 *
 * @license MIT
 * @author Md. Mahedi Zaman Zaber <https://github.com/zaber-dev>
 */

export { runCli, printHelp } from "./cli";
export { promptCommand, PromptOptions } from "./commands/prompt";
export { chatCommand, ChatOptions } from "./commands/chat";
export { listModelsCommand } from "./commands/models";
export { doctorCommand } from "./commands/doctor";
export { skillsCommand } from "./commands/skills";
