"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  BotIcon,
  CheckIcon,
  CopyIcon,
  MessageSquareIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
  TrendingUpIcon,
  UserIcon,
  ZapIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "../ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "../ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTools,
} from "../ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "../ai-elements/reasoning";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "../ai-elements/tool";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useStartupConversations,
  useStartupConversation,
  useDeleteStartupConversation,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryStates } from "nuqs";
import { searchParamsSchema } from "@/nuqs";

interface VCCoachProps {
  startupId: string;
  startupName: string;
}

export function VCCoach({ startupId, startupName }: VCCoachProps) {
  // const [selectedConversationId, setSelectedConversationId] = useState<
  //   string | null
  // >(null);
  const [params, setParams] = useQueryStates(searchParamsSchema);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: conversations, refetch: refetchList } =
    useStartupConversations(startupId);
  const { data: conversationData, isLoading: isLoadingConversation } =
    useStartupConversation(startupId, params.conversationId || "");
  const deleteConversation = useDeleteStartupConversation();

  const { messages, sendMessage, status, setMessages } = useChat({
    id: params.conversationId || undefined,
    transport: new DefaultChatTransport({
      api: `/api/startups/${startupId}/chat`,
      body: {
        conversationId: params.conversationId,
      },
      fetch: async (url: RequestInfo | URL, init: RequestInit | undefined) => {
        const response = await fetch(url, init);
        const convId = response.headers.get("x-conversation-id");
        if (convId && !params.conversationId) {
          setParams({ conversationId: convId });
          refetchList();
        }
        return response;
      },
    }),
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Load conversation history when switching sessions
  useEffect(() => {
    if (conversationData?.data?.messages) {
      const mappedMessages = conversationData.data.messages.map((m: any) => {
        const parts: any[] = [{ type: "text", text: m.content }];

        // If message has tool calls/results, we should ideally map them back
        // For now, simple text mapping is used, but we can extend for full tool support
        if (m.toolCalls && Array.isArray(m.toolCalls)) {
          for (const tc of m.toolCalls) {
            parts.push({
              type: "tool-call",
              toolCallId: tc.toolCallId || tc.id,
              toolName: tc.toolName || tc.function?.name,
              args: tc.args || JSON.parse(tc.function?.arguments || "{}"),
              state: "call-completed",
            });
          }
        }

        if (m.toolResults && Array.isArray(m.toolResults)) {
          for (const tr of m.toolResults) {
            parts.push({
              type: "tool-result",
              toolCallId: tr.toolCallId,
              toolName: tr.toolName,
              result: tr.result,
              isError: false,
            });
          }
        }

        return {
          id: m.id,
          role: m.role as any,
          parts,
          createdAt: new Date(m.createdAt),
        };
      });
      setMessages(mappedMessages as any);
    } else if (!params.conversationId) {
      setMessages([]);
    }
  }, [conversationData, params.conversationId, setMessages]);

  const handleNewChat = () => {
    setParams({ conversationId: null });
    setMessages([]);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this conversation?")) {
      await deleteConversation.mutateAsync({ startupId, conversationId: id });
      if (params.conversationId === id) {
        handleNewChat();
      }
    }
  };

  const isLoading = status === "streaming";

  const suggestedQuestions = [
    {
      label: "Review Latest Update",
      icon: TrendingUpIcon,
      prompt:
        "Review my latest weekly update and give me investor-level feedback.",
    },
    {
      label: "Refine My Pitch",
      icon: SparklesIcon,
      prompt:
        "I'm preparing for a pitch. Help me refine my narrative and identify potential red flags.",
    },
    {
      label: "Competitor Analysis",
      icon: SearchIcon,
      prompt:
        "Analyze our current competitors and suggest how we can build a stronger moat.",
    },
    {
      label: "Growth Strategy",
      icon: ZapIcon,
      prompt:
        "Based on our current stage and metrics, what should be our top 3 growth priorities?",
    },
  ];

  return (
    <div className="flex h-full mx-auto w-full border rounded-xl bg-background shadow-sm overflow-hidden">
      {/* Sidebar - Sessions List */}
      <div className="w-64 border-r bg-muted/10 flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={handleNewChat}
          >
            <PlusIcon className="w-4 h-4" />
            New Session
          </Button>
        </div>
        <ScrollArea className="w-full! overflow-x-hidden">
          <div className="p-2 space-y-1 w-full">
            {conversations?.data?.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setParams({ conversationId: conv.id })}
                className={cn(
                  "group flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-colors relative max-w-full",
                  params.conversationId === conv.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted",
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden line-clamp-1">
                  <MessageSquareIcon className="w-4 h-4 shrink-0 opacity-60" />
                  <span className="line-clamp-1">
                    {conv.title || "Untitled Session"}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-alls rounded-full absolute right-1 self-center"
                >
                  <Trash2Icon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BotIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">VC Coach</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Online & Strategic
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal">
              Startup: {startupName}
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 && !isLoadingConversation && (
              <div className="space-y-8 py-8">
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="p-4 bg-primary/5 rounded-full mb-4">
                    <BotIcon className="w-12 h-12 text-primary/40" />
                  </div>
                  <h3 className="text-xl font-bold">
                    Your Personal VC Strategic Advisor
                  </h3>
                  <p className="text-muted-foreground max-w-sm mt-2">
                    I have complete access to your startup's data, metrics, and
                    research. Ask me anything about your strategy, growth, or
                    fundraising.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-8">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => sendMessage({ text: q.prompt })}
                      className="flex items-start gap-3 p-4 text-left rounded-xl border bg-card hover:bg-accent hover:border-primary/50 transition-all group"
                    >
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                        <q.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{q.label}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {q.prompt}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoadingConversation && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCwIcon className="w-8 h-8 animate-spin text-primary/40" />
                <p className="text-sm text-muted-foreground">
                  Restoring session history...
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={`${index}-${message.id}`} className="space-y-4">
                <Message from={message.role}>
                  <div className="flex items-start gap-3 w-full">
                    {message.role === "assistant" && (
                      <div className="mt-1 shrink-0 p-1.5 bg-primary/10 rounded-md">
                        <BotIcon className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    {message.role === "user" && (
                      <div className="mt-1 shrink-0 p-1.5 bg-muted rounded-md order-last">
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex flex-col gap-2 flex-1">
                      {message.parts.map((part, i) => {
                        if (part.type === "text") {
                          const thinkingMatch = part.text.match(
                            /<thinking>([\s\S]*?)<\/thinking>/,
                          );
                          const textWithoutThinking = part.text
                            .replace(/<thinking>[\s\S]*?<\/thinking>/, "")
                            .trim();

                          return (
                            <div key={i} className="space-y-2">
                              {thinkingMatch && (
                                <Reasoning defaultOpen={false}>
                                  <ReasoningTrigger />
                                  <ReasoningContent>
                                    {thinkingMatch[1]}
                                  </ReasoningContent>
                                </Reasoning>
                              )}
                              {textWithoutThinking && (
                                <>
                                  <MessageContent
                                    className={
                                      message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : ""
                                    }
                                  >
                                    <MessageResponse>
                                      {textWithoutThinking}
                                    </MessageResponse>
                                  </MessageContent>

                                  {message.role === "assistant" && (
                                    <MessageActions className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MessageAction
                                        tooltip="Copy response"
                                        onClick={() =>
                                          handleCopy(
                                            textWithoutThinking,
                                            message.id,
                                          )
                                        }
                                      >
                                        {copiedId === message.id ? (
                                          <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                                        ) : (
                                          <CopyIcon className="w-3.5 h-3.5" />
                                        )}
                                      </MessageAction>
                                    </MessageActions>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>
                  </div>
                </Message>
              </div>
            ))}
            {status === "streaming" && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg flex items-center gap-2">
                  <RefreshCwIcon className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
            <ConversationScrollButton />
          </ConversationContent>
        </Conversation>

        {/* Input */}
        <div className="p-6 border-t bg-muted/10">
          <PromptInput
            onSubmit={(msg) => {
              if (msg.text.trim()) {
                sendMessage({ text: msg.text });
                setInput("");
              }
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your VC Coach anything..."
                className="min-h-[100px] bg-background shadow-sm"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <div className="flex items-center gap-2 px-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  <SparklesIcon className="w-3 h-3 text-amber-500" />
                  Genesyz Strategic Agent Enabled
                </div>
              </PromptInputTools>
              <PromptInputSubmit status={isLoading ? "streaming" : "ready"} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
