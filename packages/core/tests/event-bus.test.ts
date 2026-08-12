import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../src/observability/event-bus";

describe("EventBus", () => {
  it("should emit and handle typed events", () => {
    const bus = new EventBus();
    let emitted = false;

    bus.on("request:start", (evt) => {
      assert.equal(evt.requestId, "req_123");
      assert.deepEqual(evt.capabilities, ["text"]);
      emitted = true;
    });

    bus.emit("request:start", {
      requestId: "req_123",
      capabilities: ["text"],
    });

    assert.equal(emitted, true);
  });
});
