"use client";
import { Button } from "@/components/ui/button";

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function ChatSuggestions({
  suggestions,
  onSuggestionClick,
}: ChatSuggestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold font-headline">Welcome to Vyom AI</h2>
            <p className="text-muted-foreground mt-2">What can I help you with today?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="p-4 text-left border rounded-lg hover:bg-muted transition-colors text-sm"
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
        ))}
        </div>
    </div>
  );
}
