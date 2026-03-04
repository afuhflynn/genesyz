"use client";

import { useChat } from "@ai-sdk/react";
import { 
  BotIcon, 
  LightbulbIcon, 
  MessageSquareIcon, 
  RefreshCwIcon, 
  SearchIcon, 
  SparklesIcon, 
  TrendingUpIcon, 
  UserIcon,
  ZapIcon
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { 
  Conversation, 
  ConversationContent, 
  ConversationEmptyState, 
  ConversationScrollButton 
} from "../ai-elements/conversation";
import { 
  Message, 
  MessageContent, 
  MessageResponse,
  MessageActions,
  MessageAction
} from "../ai-elements/message";
import { 
  PromptInput, 
  PromptInputBody, 
  PromptInputTextarea, 
  PromptInputFooter, 
  PromptInputSubmit,
  PromptInputTools,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSelectContent,
  PromptInputSelectItem
} from "../ai-elements/prompt-input";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "../ai-elements/tool";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VCCoachProps {
  startupId: string;
  startupName: string;
}

export function VCCoach({ startupId, startupName }: VCCoachProps) {
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, append } = useChat({
    api: `/api/startups/${startupId}/chat`,
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hi! I'm your VC Coach. I've analyzed **${startupName}**'s latest data. How can I help you today? I can review your weekly updates, help you prep for pitches, or analyze your competitors.`
      }
    ]
  });

  const suggestedQuestions = [
    {
      label: "Review Latest Update",
      icon: TrendingUpIcon,
      prompt: "Review my latest weekly update and give me investor-level feedback."
    },
    {
      label: "Refine My Pitch",
      icon: SparklesIcon,
      prompt: "I'm preparing for a pitch. Help me refine my narrative and identify potential red flags."
    },
    {
      label: "Competitor Analysis",
      icon: SearchIcon,
      prompt: "Analyze our current competitors and suggest how we can build a stronger moat."
    },
    {
      label: "Growth Strategy",
      icon: ZapIcon,
      prompt: "Based on our current stage and metrics, what should be our top 3 growth priorities?"
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto w-full border rounded-xl bg-background shadow-sm overflow-hidden">
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
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Online & Strategic</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="text-xs font-normal">
             Startup: {startupName}
           </Badge>
        </div>
      </div>

      {/* Chat Area */}
      <Conversation className="flex-1 overflow-y-auto">
        <ConversationContent>
          {messages.length <= 1 && (
            <div className="space-y-8 py-8">
              <ConversationEmptyState
                title="Your Personal VC Strategic Advisor"
                description="I have complete access to your startup's data, metrics, and research. Ask me anything about your strategy, growth, or fundraising."
                icon={<BotIcon className="w-12 h-12 opacity-20" />}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-8">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => append({ role: 'user', content: q.prompt })}
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

          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              <Message from={message.role}>
                <div className="flex items-start gap-3">
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
                    <MessageContent className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                      <MessageResponse>
                        {message.content}
                      </MessageResponse>
                    </MessageContent>

                    {message.toolInvocations?.map((toolInvocation) => {
                      const { toolCallId, state } = toolInvocation;
                      
                      return (
                        <Tool key={toolCallId} state={state}>
                          <ToolHeader 
                            state={state} 
                            type="call" 
                            title={`Using Tool: ${toolInvocation.toolName.replace(/([A-Z])/g, ' $1').trim()}`} 
                          />
                          <ToolContent>
                            <ToolInput input={toolInvocation.args} />
                            {state === 'result' && (
                              <ToolOutput 
                                output={toolInvocation.result} 
                                errorText={null}
                              />
                            )}
                          </ToolContent>
                        </Tool>
                      );
                    })}
                  </div>
                </div>
              </Message>
            </div>
          ))}
          <ConversationScrollButton />
        </ConversationContent>
      </Conversation>

      {/* Input Area */}
      <div className="p-6 border-t bg-muted/10">
        <PromptInput
          onSubmit={(msg) => {
            handleSubmit(undefined, {
              data: {
                model: selectedModel,
              }
            });
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea 
              value={input}
              onChange={handleInputChange}
              placeholder="Ask your VC Coach anything..."
              className="min-h-[100px] bg-background shadow-sm"
            />
            <PromptInputFooter>
              <PromptInputTools>
                <div className="flex items-center gap-2 px-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  <SparklesIcon className="w-3 h-3 text-amber-500" />
                  Gemini 2.5 Flash Enabled
                </div>
              </PromptInputTools>
              <PromptInputSubmit status={isLoading ? "streaming" : "ready"} />
            </PromptInputFooter>
          </PromptInputBody>
        </PromptInput>
        <p className="text-[10px] text-center text-muted-foreground mt-3">
          VC Coach uses live startup data and market research to provide strategic advice.
        </p>
      </div>
    </div>
  );
}
