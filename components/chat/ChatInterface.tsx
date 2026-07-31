"use client";

/**
 * Chat Interface Component
 *
 * **AI Model Configuration**:
 * - Primary Model: Mistral `open-mixtral-8x7b` (fast, cost-effective)
 * - Fallback Model: Google Gemini 2.5 Flash (resilience on errors)
 * - User Selection: Allows manual model selection via dropdown
 *
 * **Model Options**:
 * - "mistral": Fast, cost-effective, ideal for general queries
 * - "gemini": Advanced reasoning, uses 2.5 Flash as fallback
 *
 * **Research Mode**:
 * - When enabled: Includes real-time web search tools and market insights
 * - Disabled: Uses chat model only for faster responses
 */
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Briefcase, Loader2, Search, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "../ai-elements/message";

interface ChatInterfaceProps {
  ideas?: Array<{
    id: string;
    title: string;
  }>;
}

export function ChatInterface({ ideas = [] }: ChatInterfaceProps) {
  const [selectedIdea, setSelectedIdea] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<"mistral" | "gemini">(
    "mistral",
  );
  const [includeResearch, setIncludeResearch] = useState(false);
  const [vcMode, setVcMode] = useState(false);
  const [ideas_list, setIdeasList] = useState(ideas);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        model: selectedModel,
        ideaId: selectedIdea || undefined,
        includeResearch,
        vcMode,
      },
      credentials: "same-origin",
    }),
  });
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (ideas_list.length === 0) {
      fetch("/api/ideas")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setIdeasList(
              data.map((idea: any) => ({ id: idea.id, title: idea.title })),
            );
          }
        })
        .catch(console.error);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Controls Bar */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex flex-wrap gap-3">
          {/* Idea Selector */}
          {ideas_list.length > 0 && (
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Select Idea (Optional)
              </label>
              <Select value={selectedIdea} onValueChange={setSelectedIdea}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="General chat or select an idea..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">General Chat</SelectItem>
                  {ideas_list.map((idea) => (
                    <SelectItem key={idea.id} value={idea.id}>
                      {idea.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Model Selector */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-gray-700 block mb-1">
              AI Model
            </label>
            <Select
              value={selectedModel}
              onValueChange={(val) =>
                setSelectedModel(val as "mistral" | "gemini")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mistral">Mistral (Fast)</SelectItem>
                <SelectItem value="gemini">Google Gemini (Advanced)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Research Toggle */}
          <div className="flex items-end">
            <Button
              variant={includeResearch ? "default" : "outline"}
              size="sm"
              onClick={() => setIncludeResearch(!includeResearch)}
              className="flex gap-2"
            >
              <Search className="w-4 h-4" />
              {includeResearch ? "Research On" : "Research Off"}
            </Button>
          </div>

          {/* VC Toggle */}
          <div className="flex items-end">
            <Button
              variant={vcMode ? "default" : "outline"}
              size="sm"
              onClick={() => setVcMode(!vcMode)}
              className={`flex gap-2 ${vcMode ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              <Briefcase className="w-4 h-4" />
              {vcMode ? "VC On" : "VC"}
            </Button>
          </div>
        </div>
        {includeResearch && (
          <p className="text-xs text-blue-600 mt-2">
            💡 Research mode: Responses will include real-time web data and
            market insights
          </p>
        )}
        {vcMode && (
          <p className="text-xs text-green-600 mt-2">
            💡 VC mode: Get investor perspective feedback on your pitch,
            business model, and growth strategy
          </p>
        )}
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm mt-2">
                {selectedIdea
                  ? "Ask questions about your selected idea"
                  : "Ask about your ideas, market trends, or get general advice"}
              </p>
              {includeResearch && (
                <p className="text-xs mt-2 text-blue-600">
                  Research mode is active - get insights backed by web data
                </p>
              )}
            </div>
          )}
          {messages.map(({ role, parts }, index) => (
            <Message from={role} key={index}>
              <MessageContent>
                {parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <MessageResponse key={`${role}-${i}`}>
                          {part.text}
                        </MessageResponse>
                      );
                  }
                })}
              </MessageContent>
            </Message>
          ))}
          {status === "streaming" && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {includeResearch
                    ? "Researching and thinking..."
                    : "Thinking..."}
                </span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              sendMessage({ text: input });
              setInput("");
            }
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedIdea ? "Ask about this idea..." : "Ask a question..."
            }
            // disabled={status !== "ready" || error !== null}
            className="flex-1"
            autoFocus
          />
          <Button
            type="submit"
            disabled={status === "streaming" || !input.trim()}
            size="icon"
            className="bg-blue-500 hover:bg-blue-600"
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
