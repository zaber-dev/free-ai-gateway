import fs from "node:fs";
import path from "node:path";

export type AgentTarget = "antigravity" | "claude" | "cursor" | "copilot" | "all";

export interface SkillInfo {
  id: string;
  name: string;
  description: string;
  path: string;
}

export interface InstallResult {
  target: string;
  installedSkills: string[];
  destinationPath: string;
}

/**
 * Discovers all built-in skills packaged in @free-ai-gateway/skills.
 */
export function listSkills(): SkillInfo[] {
  // Search in source skills directory or compiled dist
  const candidateDirs = [
    path.join(__dirname, "skills"),
    path.join(__dirname, "../src/skills"),
  ];

  let skillsDir = candidateDirs.find((d) => fs.existsSync(d));
  if (!skillsDir) {
    return [];
  }

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const skills: SkillInfo[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillFile = path.join(skillsDir, entry.name, "SKILL.md");
      if (fs.existsSync(skillFile)) {
        const content = fs.readFileSync(skillFile, "utf-8");
        const nameMatch = content.match(/name:\s*(.+)/);
        const descMatch = content.match(/description:\s*(.+)/);

        skills.push({
          id: entry.name,
          name: nameMatch ? nameMatch[1].trim() : entry.name,
          description: descMatch ? descMatch[1].trim() : "Free-AI Gateway Skill",
          path: skillFile,
        });
      }
    }
  }

  return skills;
}

/**
 * Returns the raw markdown content of a specific skill.
 */
export function getSkillContent(skillId: string): string | null {
  const skills = listSkills();
  const found = skills.find((s) => s.id === skillId);
  if (!found) return null;
  return fs.readFileSync(found.path, "utf-8");
}

/**
 * Resolves standard target installation path for a given agent runtime.
 */
export function getTargetDirectory(target: AgentTarget, baseDir = process.cwd()): string[] {
  switch (target) {
    case "antigravity":
      return [path.join(baseDir, ".agents", "skills")];
    case "claude":
      return [path.join(baseDir, ".claude", "skills")];
    case "cursor":
      return [path.join(baseDir, ".cursor", "skills")];
    case "copilot":
      return [path.join(baseDir, ".github", "skills")];
    case "all":
      return [
        path.join(baseDir, ".agents", "skills"),
        path.join(baseDir, ".claude", "skills"),
        path.join(baseDir, ".cursor", "skills"),
        path.join(baseDir, ".github", "skills"),
      ];
  }
}

/**
 * Installs Free-AI Gateway skills into the specified agent directory.
 */
export function installSkills(
  target: AgentTarget = "antigravity",
  customDestination?: string,
  baseDir = process.cwd()
): InstallResult[] {
  const skills = listSkills();
  const destinations = customDestination ? [customDestination] : getTargetDirectory(target, baseDir);
  const results: InstallResult[] = [];

  for (const dest of destinations) {
    fs.mkdirSync(dest, { recursive: true });
    const installed: string[] = [];

    for (const skill of skills) {
      const skillDestDir = path.join(dest, skill.id);
      fs.mkdirSync(skillDestDir, { recursive: true });
      const targetFile = path.join(skillDestDir, "SKILL.md");
      fs.copyFileSync(skill.path, targetFile);
      installed.push(skill.id);
    }

    results.push({
      target,
      installedSkills: installed,
      destinationPath: dest,
    });
  }

  return results;
}
