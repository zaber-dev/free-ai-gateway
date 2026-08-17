#!/usr/bin/env node
import { installSkills, listSkills, AgentTarget } from "./installer";

function printHelp() {
  console.log(`
⚡ Free-AI Gateway Skills CLI (free-ai-skills)

Usage:
  npx @free-ai-gateway/skills <command> [options]

Commands:
  list                          List all available built-in agent skills
  install [options]             Install skills to agent/IDE configuration directories

Options:
  --target=<target>             Target agent: antigravity | claude | cursor | copilot | all (Default: antigravity)
  --dest=<path>                 Custom destination directory for skill files
  --help, -h                    Show this help message

Examples:
  npx @free-ai-gateway/skills list
  npx @free-ai-gateway/skills install --target=antigravity
  npx @free-ai-gateway/skills install --target=cursor
  npx @free-ai-gateway/skills install --target=all
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  if (command === "--help" || command === "-h" || command === "help") {
    printHelp();
    return;
  }

  if (command === "list") {
    const skills = listSkills();
    console.log(`\n📦 Available Free-AI Gateway Skills (${skills.length} total):\n`);
    for (const skill of skills) {
      console.log(`  🔹 ${skill.name} (${skill.id})`);
      console.log(`     ${skill.description}\n`);
    }
    return;
  }

  if (command === "install") {
    let target: AgentTarget = "antigravity";
    let customDest: string | undefined;

    for (const arg of args.slice(1)) {
      if (arg.startsWith("--target=")) {
        target = arg.replace("--target=", "") as AgentTarget;
      } else if (arg.startsWith("--dest=")) {
        customDest = arg.replace("--dest=", "");
      }
    }

    console.log(`\n🚀 Installing Free-AI Gateway skills for target: "${target}"...`);
    const results = installSkills(target, customDest);

    for (const res of results) {
      console.log(`\n✅ Installed ${res.installedSkills.length} skills to:`);
      console.log(`   📂 ${res.destinationPath}`);
      for (const id of res.installedSkills) {
        console.log(`      - ${id}`);
      }
    }
    console.log("\n🎉 Done! Your agent is now powered with Free-AI Gateway skills.\n");
    return;
  }

  console.error(`Unknown command: "${command}". Run "free-ai-skills --help" for usage.`);
  process.exit(1);
}

main().catch((err) => {
  console.error("Error executing skills CLI:", err);
  process.exit(1);
});
