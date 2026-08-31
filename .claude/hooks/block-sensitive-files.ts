/* eslint-disable @typescript-eslint/no-explicit-any */
import micromatch from "micromatch";
import process from "node:process";
import { hooksLogger } from "./hooks-logger";
import {
  PreToolUseHookInput,
  SyncHookJSONOutput,
} from "@anthropic-ai/claude-agent-sdk";

const HOOK_NAME = "block-sensitive-files";

class SensitiveFileAccessError extends Error {}

// Edit this list to configure which file patterns are blocked.
const SENSITIVE_PATTERNS: string[] = [
  "**/.env",
  "**/.env.*",
  "**/*.pem",
  "**/*.key",
  "**/*.p12",
  "**/*.pfx",
  "**/id_rsa",
  "**/id_ed25519",
  "**/.ssh/**",
  "**/secrets/**",
  "**/credentials.json",
  "**/hooks/**",
];

const readInput = async () => {
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  return input;
};

async function main() {
  try {
    const input = await readInput();
    const preToolUseInput = JSON.parse(input) as PreToolUseHookInput;
    hooksLogger.info(HOOK_NAME, "tool_input", preToolUseInput);
    const filePath = (preToolUseInput.tool_input as any).file_path as string;

    SENSITIVE_PATTERNS.forEach((pattern) => {
      hooksLogger.debug(HOOK_NAME, "info", pattern + "," + filePath);
      if (micromatch.isMatch(filePath, pattern)) {
        throw new SensitiveFileAccessError();
      }
    });

    const output: SyncHookJSONOutput = {
      continue: true,
      decision: "approve",
    };
    hooksLogger.info(HOOK_NAME, "success_response", output);
    console.log(JSON.stringify(output));
    process.exit(0);
  } catch (e) {
    let output: SyncHookJSONOutput;
    if (e instanceof SensitiveFileAccessError) {
      output = {
        continue: false,
        decision: "block",
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "access to sensitive files is restricted",
        },
      };
    } else {
      hooksLogger.debug(HOOK_NAME, "error", (e as any).message);
      output = {
        continue: false,
        decision: "block",
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason:
            "something went wrong while checking file access",
        },
      };
    }
    hooksLogger.info(HOOK_NAME, "error_response", output);
    console.log(JSON.stringify(output));
    process.exit(0);
  }
}

main();
