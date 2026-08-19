import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runCli } from "../src/cli";

describe("Free-AI Gateway CLI", () => {
  it("should output help screen when called with --help", async () => {
    let output = "";
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
    };

    try {
      await runCli(["--help"]);
      assert.ok(output.includes("Free-AI Gateway CLI"));
      assert.ok(output.includes("prompt"));
      assert.ok(output.includes("models"));
      assert.ok(output.includes("doctor"));
    } finally {
      console.log = originalLog;
    }
  });

  it("should list discovered models in default text format", async () => {
    let output = "";
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
    };

    try {
      await runCli(["models"]);
      assert.ok(output.includes("Discovered Models & Capabilities"));
      assert.ok(output.includes("Provider ID"));
      assert.ok(output.includes("groq"));
    } finally {
      console.log = originalLog;
    }
  });

  it("should output models in valid JSON format with --format=json", async () => {
    let output = "";
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
    };

    try {
      await runCli(["models", "--format=json"]);
      const parsed = JSON.parse(output.trim());
      assert.ok(Array.isArray(parsed));
      assert.ok(parsed.length > 0);
      assert.ok(parsed[0].provider);
      assert.ok(parsed[0].model);
      assert.ok(Array.isArray(parsed[0].capabilities));
    } finally {
      console.log = originalLog;
    }
  });

  it("should output models in valid JSON format with --format json", async () => {
    let output = "";
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
    };

    try {
      await runCli(["models", "--format", "json"]);
      const parsed = JSON.parse(output.trim());
      assert.ok(Array.isArray(parsed));
      assert.ok(parsed.length > 0);
    } finally {
      console.log = originalLog;
    }
  });

  it("should output models in Markdown table format with --format=markdown", async () => {
    let output = "";
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
    };

    try {
      await runCli(["models", "--format=markdown"]);
      assert.ok(output.includes("| Provider ID | Model ID | Capabilities |"));
      assert.ok(output.includes("| :--- | :--- | :--- |"));
      assert.ok(output.includes("groq"));
    } finally {
      console.log = originalLog;
    }
  });

  it("should run diagnostics (doctor) command", async () => {
    let output = "";
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
    };

    try {
      await runCli(["doctor"]);
      assert.ok(output.includes("Free-AI Gateway Diagnostics"));
      assert.ok(output.includes("Summary:"));
    } finally {
      console.log = originalLog;
    }
  });

  it("should filter models by capability and provider using CLI flags", async () => {
    let output = "";
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
    };

    try {
      await runCli(["models", "-f", "json", "--capability=text", "-p", "groq"]);
      const parsed = JSON.parse(output.trim());
      assert.ok(Array.isArray(parsed));
      assert.ok(parsed.length > 0);
      assert.ok(parsed.every((m: any) => m.provider === "groq"));
      assert.ok(parsed.every((m: any) => m.capabilities.includes("text")));
    } finally {
      console.log = originalLog;
    }
  });

  it("should show version when requested with --version", async () => {
    let output = "";
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      output += args.join(" ") + "\n";
    };

    try {
      await runCli(["--version"]);
      assert.ok(output.includes("free-ai-gateway/cli v1.0.0"));
    } finally {
      console.log = originalLog;
    }
  });
});
