"use client";
import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Volume2, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

export function ChatMessage({ 
  message,
  onSpeak,
  isSpeaking,
}: {
  message: ChatMessageType,
  onSpeak: (message: ChatMessageType) => void,
  isSpeaking: boolean
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-4 animate-in fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 border-2 border-primary">
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-lg p-3 text-sm shadow-md",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card text-card-foreground"
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-pre:my-2 prose-pre:rounded-md prose-pre:bg-background/50 prose-pre:p-3 prose-code:font-code prose-code:before:content-[''] prose-code:after:content-['']">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {!isUser && (
          <Button
            data-role="tts-button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 mt-2 text-muted-foreground hover:text-foreground"
            onClick={() => onSpeak(message)}
            aria-label={isSpeaking ? "Stop speaking" : "Read message aloud"}
          >
            {isSpeaking ? <StopCircle className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
