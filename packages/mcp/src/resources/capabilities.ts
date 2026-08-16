import { ALL_CAPABILITIES } from "@free-ai-gateway/core";

export function listCapabilitiesResource() {
  return {
    uri: "freeai://capabilities",
    name: "FreeAI Supported Capabilities",
    mimeType: "application/json",
    text: JSON.stringify(ALL_CAPABILITIES, null, 2),
  };
}
