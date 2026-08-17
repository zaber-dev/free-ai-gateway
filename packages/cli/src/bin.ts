#!/usr/bin/env node
import { runCli } from "./cli";

runCli().catch((err) => {
  console.error("Fatal CLI Error:", err);
  process.exit(1);
});
