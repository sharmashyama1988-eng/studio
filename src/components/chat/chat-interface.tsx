"use client";
import { useState, useRef, useEffect, type FormEvent } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { getAiResponse } from "@/app/actions";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, LoaderCircle, Mic, Settings, StopCircle, Volume2 } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { ChatSuggestions } from "./chat-suggestions";
import { ChatMessageSkeleton } from "./chat-message-skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export function ChatInterface({ startingPrompts }: { startingPrompts: string[] }) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) {
      console.warn("Speech recognition not supported");
      return;
    }
    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error !== 'no-speech') {
        toast({
          variant: "destructive",
          title: "Speech Recognition Error",
          description: "Sorry, I couldn't understand that. Please try again.",
        });
      }
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognitionRef.current = recognition;
  }, [toast]);
  
  useEffect(() => {
    const handleScreenTap = (event: MouseEvent) => {
      if (speakingMessageId && !(event.target as HTMLElement).closest('[data-role="tts-button"]')) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
      }
    };

    document.addEventListener('click', handleScreenTap);

    return () => {
      document.removeEventListener('click', handleScreenTap);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speakingMessageId]);


  const handleListen = () => {
    if (!recognitionRef.current) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Speech recognition is not supported by your browser.",
      });
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      inputRef.current?.focus();
      setInputValue("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };
  
  const handleSpeak = (message: ChatMessageType) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Text-to-speech is not supported by your browser.",
      });
      return;
    }

    if (speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      toast({
        variant: "destructive",
        title: "Text-to-Speech Error",
        description: "Sorry, I couldn't read that message.",
      });
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(message.id);
  };

  const handleMessageSubmit = async (content: string) => {
    if (isLoading || !content.trim()) return;

    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: "user",
      content,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setInputValue("");
    inputRef.current?.focus();

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
      setMessages((prev) => prev.slice(0, prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleMessageSubmit(inputValue);
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
    <div className="flex flex-col h-full relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" aria-label="Voice settings">
            <Settings className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 mr-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Voice Settings</h4>
              <p className="text-sm text-muted-foreground">Adjust text-to-speech voice.</p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="rate">Speed</Label>
                <Slider id="rate" min={0.5} max={2} step={0.1} defaultValue={[speechRate]} onValueChange={(value) => setSpeechRate(value[0])} className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="pitch">Pitch</Label>
                <Slider id="pitch" min={0} max={2} step={0.1} defaultValue={[speechPitch]} onValueChange={(value) => setSpeechPitch(value[0])} className="col-span-2 h-8" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
          {messages.length === 0 && !isLoading ? (
            <ChatSuggestions suggestions={startingPrompts} onSuggestionClick={handleSuggestionClick} />
          ) : (
            messages.map((message) => <ChatMessage key={message.id} message={message} onSpeak={handleSpeak} isSpeaking={speakingMessageId === message.id} />)
          )}
          {isLoading && <ChatMessageSkeleton />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="border-t p-4 md:p-6 bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <Textarea
            ref={inputRef}
            placeholder="Message Vyom AI..."
            className="pr-28 min-h-[48px] rounded-2xl resize-none"
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full"
              onClick={handleListen}
              disabled={isLoading}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              <Mic className={cn("h-5 w-5", isListening && "text-primary animate-pulse")} />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="rounded-full"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              {isLoading ? (<LoaderCircle className="h-5 w-5 animate-spin" />) : (<Send className="h-5 w-5" />)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
