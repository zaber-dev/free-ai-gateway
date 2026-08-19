import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Registry } from "../src/providers/registry";

describe("Registry", () => {
  it("should initialize successfully and load all provider configurations", () => {
    const registry = new Registry();
    assert.ok(registry.adapters.length >= 20, "Expected at least 20 adapters instantiated");
  });

  it("should find matching candidates for 'text' capability", () => {
    const registry = new Registry();
    const candidates = registry.getCandidates(["text"]);
    assert.ok(candidates.length > 0);

    for (const c of candidates) {
      assert.ok(c.model.capabilities.includes("text"));
    }
  });

  it("should find matching candidates for multiple capabilities", () => {
    const registry = new Registry();
    const candidates = registry.getCandidates(["text", "tool_calling"]);
    assert.ok(candidates.length > 0);

    for (const c of candidates) {
      assert.ok(c.model.capabilities.includes("text"));
      assert.ok(c.model.capabilities.includes("tool_calling"));
    }
  });

  it("should return empty list for unsupported capability combinations", () => {
    const registry = new Registry();
    const candidates = registry.getCandidates(["embedding", "speech_to_text"]);
    assert.equal(candidates.length, 0);
  });
});
