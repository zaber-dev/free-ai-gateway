import { listSkills, installSkills, AgentTarget } from "@free-ai-gateway/skills";

export function skillsCommand(args: string[]): void {
  const subCommand = args[0] || "list";

  if (subCommand === "list") {
    const skills = listSkills();
    console.log(`\n📦 Available Free-AI Gateway Skills (${skills.length} total):\n`);
    for (const skill of skills) {
      console.log(`  🔹 ${skill.name} (${skill.id})`);
      console.log(`     ${skill.description}\n`);
    }
    return;
  }

  if (subCommand === "install") {
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
    console.log("\n🎉 Skills installed successfully!\n");
    return;
  }

  console.error(`Unknown skills sub-command: "${subCommand}". Options: list | install`);
}
