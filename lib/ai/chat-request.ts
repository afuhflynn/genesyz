type ChatMessage = {
  role?: unknown;
  content?: unknown;
};

export function normalizeConversationId(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function getLastUserMessage(messages: unknown[]): ChatMessage | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (
      message &&
      typeof message === "object" &&
      (message as ChatMessage).role === "user"
    ) {
      return message as ChatMessage;
    }
  }

  return null;
}

export function serializeMessageContent(content: unknown): string {
  return typeof content === "string" ? content : JSON.stringify(content);
}
