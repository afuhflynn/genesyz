"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  ArrowLeft,
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
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Conversation, ConversationContent, ConversationScrollButton } from "../ai-elements/conversation";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  useStartupConversations,
  useStartupConversation,
  useDeleteStartupConversation,
  useCreateStartupConversation,
} from "@/hooks";
import { toast } from "sonner";

interface VCCoachProps {
  startupId: string;
  startupName: string;
  conversationId?: string;
}

export function VCCoach({ startupId, startupName, conversationId }: VCCoachProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeConvId, setActiveConvId] = useState<string | null>(conversationId ?? null);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const hasAutoSent = useRef(false);
  const pendingConvIdRef = useRef<string | null>(null);

  const { data: conversations, refetch: refetchList } = useStartupConversations(startupId);
  const { data: conversationData } = useStartupConversation(
    startupId,
    activeConvId || "",
  );
  const deleteConversation = useDeleteStartupConversation();
  const createConversation = useCreateStartupConversation();

  const activeConvIdRef = useRef(activeConvId);
  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: activeConvId || undefined,
    transport: new DefaultChatTransport({
      api: `/api/startups/${startupId}/chat`,
      body: () => ({
        conversationId: activeConvIdRef.current,
      }),
      fetch: async (url: RequestInfo | URL, init: RequestInit | undefined) => {
        console.log("[FETCH_INTERCEPTOR] Initiated request to:", url);
        const response = await fetch(url, init);
        console.log("[FETCH_INTERCEPTOR] Response status:", response.status);
        console.log("[FETCH_INTERCEPTOR] Response headers:", Array.from(response.headers.entries()));
        const convId = response.headers.get("x-conversation-id");
        console.log("[FETCH_INTERCEPTOR] Found x-conversation-id:", convId);
        if (convId && activeConvId !== convId) {
          pendingConvIdRef.current = convId;
          console.log("[FETCH_INTERCEPTOR] Updating browser URL to:", `/startups/${slug}/chat/${convId}`);
          window.history.replaceState(null, "", `/startups/${slug}/chat/${convId}`);
          refetchList();
        }
        return response;
      },
    }),
  });

  useEffect(() => {
    if (status === "ready" && pendingConvIdRef.current) {
      setActiveConvId(pendingConvIdRef.current);
      pendingConvIdRef.current = null;
    }
  }, [status]);

  const isLoading = status === "streaming";

  const loadMessagesFromDb = useCallback((msgs: any[]) => {
    const mappedMessages = msgs.map((m: any) => {
      const parts: any[] = [{ type: "text", text: m.content }];

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
  }, [setMessages]);

  useEffect(() => {
    if (conversationData?.data?.messages) {
      loadMessagesFromDb(conversationData.data.messages);
    } else if (!activeConvId) {
      setMessages([]);
    }
  }, [conversationData, activeConvId, loadMessagesFromDb, setMessages]);

  useEffect(() => {
    setActiveConvId(conversationId ?? null);
  }, [conversationId]);

  useEffect(() => {
    const initialQuestion = searchParams.get("q");
    if (initialQuestion && activeConvId && !hasAutoSent.current) {
      hasAutoSent.current = true;
      const timer = setTimeout(() => sendMessage({ text: initialQuestion }), 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams, activeConvId, sendMessage]);

  const handleNewChat = () => {
    router.push(`/startups/${slug}/chat`);
  };

  const handleSelectConversation = (id: string) => {
    if (activeConvId !== id) {
      router.push(`/startups/${slug}/chat/${id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this conversation?")) {
      await deleteConversation.mutateAsync({ startupId, conversationId: id });
      if (activeConvId === id) {
        handleNewChat();
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    sendMessage({ text });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedQuestions = [
    {
      label: "Review Latest Update",
      icon: TrendingUpIcon,
      prompt: "Review my latest weekly update and give me investor-level feedback.",
    },
    {
      label: "Refine My Pitch",
      icon: SparklesIcon,
      prompt: "I'm preparing for a pitch. Help me refine my narrative and identify potential red flags.",
    },
    {
      label: "Competitor Analysis",
      icon: SearchIcon,
      prompt: "Analyze our current competitors and suggest how we can build a stronger moat.",
    },
    {
      label: "Growth Strategy",
      icon: ZapIcon,
      prompt: "Based on our current stage and metrics, what should be our top 3 growth priorities?",
    },
  ];

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={handleNewChat}
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Session</span>
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {conversations?.data?.map((conv) => (
                  <SidebarMenuItem key={conv.id}>
                    <SidebarMenuButton
                      onClick={() => handleSelectConversation(conv.id)}
                      isActive={activeConvId === conv.id}
                    >
                      <MessageSquareIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate flex-1 text-left">
                        {conv.title || "Untitled Session"}
                      </span>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    >
                      <Trash2Icon className="w-3 h-3" />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to Startup Dashboard">
                <Link href={`/startups/${slug}`} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span>Back to Startup</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="flex items-center gap-3 ml-2">
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
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal hidden sm:inline-flex">
              Startup: {startupName}
            </Badge>
          </div>
        </header>

        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 && status === "ready" && (
              <div className="space-y-8 py-8">
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="p-4 bg-primary/5 rounded-full mb-4">
                    <BotIcon className="w-12 h-12 text-primary/40" />
                  </div>
                  <h3 className="text-xl font-bold">Your Personal VC Strategic Advisor</h3>
                  <p className="text-muted-foreground max-w-sm mt-2">
                    I have complete access to your startup's data, metrics, and research. Ask me anything about your strategy, growth, or fundraising.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-8">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => handleSendMessage(q.prompt)}
                      className="flex items-start gap-3 p-4 text-left rounded-xl border bg-card hover:bg-accent hover:border-primary/50 transition-all group"
                    >
                      <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                        <q.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{q.label}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{q.prompt}</div>
                      </div>
                    </button>
                  ))}
                </div>
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
                          const thinkingMatch = part.text.match(/<thinking>([\s\S]*?)<\/thinking>/);
                          const textWithoutThinking = part.text.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim();

                          return (
                            <div key={i} className="space-y-2">
                              {thinkingMatch && (
                                <Reasoning defaultOpen={false}>
                                  <ReasoningTrigger />
                                  <ReasoningContent>{thinkingMatch[1]}</ReasoningContent>
                                </Reasoning>
                              )}
                              {textWithoutThinking && (
                                <>
                                  <MessageContent
                                    className={message.role === "user" ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground" : ""}
                                  >
                                    <MessageResponse>{textWithoutThinking}</MessageResponse>
                                  </MessageContent>

                                  {message.role === "assistant" && (
                                    <MessageActions className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MessageAction
                                        tooltip="Copy response"
                                        onClick={() => handleCopy(textWithoutThinking, message.id)}
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

        <div className="p-6 border-t bg-muted/10">
          <PromptInput
            onSubmit={(msg) => {
              if (msg.text.trim()) {
                handleSendMessage(msg.text);
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
      </SidebarInset>
    </>
  );
}
