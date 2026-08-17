import { promptCommand, PromptOptions } from "./commands/prompt";
import { chatCommand, ChatOptions } from "./commands/chat";
import { listModelsCommand, ModelsOptions } from "./commands/models";
import { doctorCommand } from "./commands/doctor";
import { skillsCommand } from "./commands/skills";

export function printHelp(): void {
  console.log(`
⚡ Free-AI Gateway CLI (free-ai / freeai)

Usage:
  free-ai <command> [options]
  free-ai "<prompt>" [options]

Commands:
  prompt <query>        Execute a one-off AI prompt with automatic capability routing
  chat                  Launch an interactive terminal chat REPL session
  models                List all discovered models, providers, and supported capabilities
  doctor / health       Perform diagnostics and check configured API keys
  skills <list|install> Manage and install agentic IDE skills (Antigravity, Cursor, Claude)

Options:
  --capability=<cap>    Required capability (e.g. text, reasoning, code, vision, tool_calling)
  --provider=<id>       Force preferred provider (e.g. groq, google, sambanova, openrouter)
  --model=<id>          Force preferred model identifier
  --format=<format>     Output format for models command: text, json, markdown
  --help, -h            Show this help manual
  --version, -v         Display CLI version

Examples:
  free-ai "Explain quantum computing in one sentence"
  free-ai prompt "Write a quicksort in TypeScript" --capability=code
  free-ai chat --capability=reasoning
  free-ai models
  free-ai models --format=json
  free-ai models --format markdown
  free-ai doctor
  free-ai skills install --target=antigravity
`);
}

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<void> {
  const command = argv[0];

  if (!command || command === "--help" || command === "-h" || command === "help") {
    printHelp();
    return;
  }

  if (command === "--version" || command === "-v" || command === "version") {
    console.log("free-ai-gateway/cli v1.0.0");
    return;
  }

  if (command === "models") {
    const modelsOpts: ModelsOptions = {};
    const rest = argv.slice(1);
    for (let i = 0; i < rest.length; i++) {
      const arg = rest[i];
      if (arg.startsWith("--format=")) {
        modelsOpts.format = arg.replace("--format=", "");
      } else if (arg === "--format" && rest[i + 1]) {
        modelsOpts.format = rest[i + 1];
        i++;
      }
    }
    listModelsCommand(modelsOpts);
    return;
  }

  if (command === "doctor" || command === "health") {
    doctorCommand();
    return;
  }

  if (command === "skills") {
    skillsCommand(argv.slice(1));
    return;
  }

  if (command === "chat") {
    const chatOpts: ChatOptions = {};
    for (const arg of argv.slice(1)) {
      if (arg.startsWith("--capability=")) chatOpts.capability = arg.replace("--capability=", "");
      if (arg.startsWith("--provider=")) chatOpts.provider = arg.replace("--provider=", "");
      if (arg.startsWith("--model=")) chatOpts.model = arg.replace("--model=", "");
    }
    await chatCommand(chatOpts);
    return;
  }

  if (command === "prompt" || !command.startsWith("-")) {
    const promptText = command === "prompt" ? argv[1] : command;
    if (!promptText) {
      console.error("❌ Error: Missing prompt text. Run 'free-ai --help' for usage.");
      process.exitCode = 1;
      return;
    }

    const promptOpts: PromptOptions = {};
    const remainingArgs = command === "prompt" ? argv.slice(2) : argv.slice(1);
    for (const arg of remainingArgs) {
      if (arg.startsWith("--capability=")) promptOpts.capability = arg.replace("--capability=", "");
      if (arg.startsWith("--provider=")) promptOpts.provider = arg.replace("--provider=", "");
      if (arg.startsWith("--model=")) promptOpts.model = arg.replace("--model=", "");
    }

    await promptCommand(promptText, promptOpts);
    return;
  }

  console.error(`❌ Unknown command: "${command}". Run "free-ai --help" for usage.`);
  process.exitCode = 1;
}
