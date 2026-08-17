import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { listSkills, getSkillContent, installSkills, getTargetDirectory } from "../src/installer";

describe("Agentic Skills Package", () => {
  it("should list all built-in skills with valid metadata", () => {
    const skills = listSkills();
    assert.ok(skills.length >= 3, "Expected at least 3 built-in skills");

    const ids = skills.map((s) => s.id);
    assert.ok(ids.includes("free-ai-gateway"), "Should include free-ai-gateway skill");
    assert.ok(ids.includes("provider-scaffolding"), "Should include provider-scaffolding skill");
    assert.ok(ids.includes("mcp-integration"), "Should include mcp-integration skill");

    for (const skill of skills) {
      assert.ok(skill.name, `Skill ${skill.id} should have a name`);
      assert.ok(skill.description, `Skill ${skill.id} should have a description`);
      assert.ok(fs.existsSync(skill.path), `Skill path ${skill.path} should exist`);
    }
  });

  it("should fetch skill markdown content by id", () => {
    const content = getSkillContent("free-ai-gateway");
    assert.ok(content, "Content should not be null");
    assert.ok(content.includes("Free-AI Gateway"), "Content should contain skill documentation");
  });

  it("should resolve correct target directories for agent runtimes", () => {
    const cwd = "C:\\test\\workspace";
    const antigravityPaths = getTargetDirectory("antigravity", cwd);
    assert.equal(antigravityPaths[0], path.join(cwd, ".agents", "skills"));

    const cursorPaths = getTargetDirectory("cursor", cwd);
    assert.equal(cursorPaths[0], path.join(cwd, ".cursor", "skills"));

    const allPaths = getTargetDirectory("all", cwd);
    assert.equal(allPaths.length, 4);
  });

  it("should install skills into target directory", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "skills-test-"));
    try {
      const results = installSkills("antigravity", path.join(tempDir, "skills"));
      assert.equal(results.length, 1);
      assert.ok(results[0].installedSkills.length >= 3);

      const installedGatewaySkill = path.join(tempDir, "skills", "free-ai-gateway", "SKILL.md");
      assert.ok(fs.existsSync(installedGatewaySkill), "Installed skill file should exist");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
