import { ChatInterface } from "@/components/chat/ChatInterface";

export const metadata = {
  title: "Chat | Ideas Vault",
  description: "Chat with AI to brainstorm and refine your ideas",
};

export default function ChatPage() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Idea Chat</h1>
        <p className="text-gray-600 mt-2">
          Brainstorm, refine, and research your ideas with AI assistance
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
