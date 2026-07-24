import { describe, expect, it } from "vitest";
import {
  getLastUserMessage,
  normalizeConversationId,
  serializeMessageContent,
} from "./chat-request";

describe("chat request helpers", () => {
  it("requires a non-empty conversation id", () => {
    expect(normalizeConversationId(undefined)).toBeNull();
    expect(normalizeConversationId("  ")).toBeNull();
    expect(normalizeConversationId("conversation-1")).toBe("conversation-1");
  });

  it("finds the latest user message", () => {
    expect(
      getLastUserMessage([
        { role: "user", content: "first" },
        { role: "assistant", content: "answer" },
        { role: "user", content: "latest" },
      ]),
    ).toEqual({ role: "user", content: "latest" });
  });

  it("serializes structured message content for persistence", () => {
    expect(serializeMessageContent([{ type: "text", text: "hello" }])).toBe(
      '[{"type":"text","text":"hello"}]',
    );
  });
});
