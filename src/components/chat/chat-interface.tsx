"use client";
import { useState, useRef, useEffect, type FormEvent } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { getAiResponse } from "@/app/actions";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, LoaderCircle } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { ChatSuggestions } from "./chat-suggestions";
import { ChatMessageSkeleton } from "./chat-message-skeleton";

export function ChatInterface({ startingPrompts }: { startingPrompts: string[] }) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleMessageSubmit = async (content: string) => {
    if (isLoading) return;
    if (!content.trim()) return;

    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: "user",
      content,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
    }

    try {
      const aiResponse = await getAiResponse(newMessages);
      const assistantMessage: ChatMessageType = {
        id: uuidv4(),
        role: "assistant",
        content: aiResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the AI.",
      });
      // Remove the user message if AI fails
      setMessages((prev) => prev.slice(0, prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputRef.current) {
      handleMessageSubmit(inputRef.current.value);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleMessageSubmit(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
          {messages.length === 0 && !isLoading ? (
            <ChatSuggestions suggestions={startingPrompts} onSuggestionClick={handleSuggestionClick} />
          ) : (
            messages.map((message) => <ChatMessage key={message.id} message={message} />)
          )}
          {isLoading && <ChatMessageSkeleton />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="border-t p-4 md:p-6 bg-background/80 backdrop-blur-sm">
        <form
          onSubmit={handleSubmit}
          className="relative max-w-3xl mx-auto"
        >
          <Textarea
            ref={inputRef}
            placeholder="Message Vyom AI..."
            className="pr-16 min-h-[48px] rounded-2xl resize-none"
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 right-3 rounded-full"
            disabled={isLoading}
            aria-label="Send message"
          >
            {isLoading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
