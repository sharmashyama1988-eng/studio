'use server';

import { ai } from "@/ai/genkit";
import type { ChatMessage, UserFact } from "@/lib/types";
import { extractUserFacts } from "@/ai/flows/extract-user-facts";
import { classifyIntent } from "@/ai/flows/classify-intent";
import { answerWithSearch } from "@/ai/flows/answer-with-search";

export async function extractFactsFromMessage(message: string): Promise<string[]> {
  try {
    const result = await extractUserFacts({ userInput: message });
    return result.facts;
  } catch (error) {
    console.error("Error extracting facts:", error);
    return [];
  }
}

export async function getAiResponse(history: ChatMessage[], facts: UserFact[]): Promise<string> {
  const latestUserMessage = history[history.length - 1].content;

  try {
    // 1. Classify Intent
    const { intent } = await classifyIntent({ message: latestUserMessage });

    // 2. Route based on intent
    if (intent === 'search') {
      console.log("[Intent] Classified as 'search'. Using web search tool.");
      return await answerWithSearch({ history, facts });
    } else {
      console.log("[Intent] Classified as 'casual'. Using local model only.");
      // Case A: Casual/Reasoning - USE ONLY LOCAL LLM (no tools)
      const factsContext = facts.length > 0
        ? `
Here are some facts about the user you are talking to. Use them to personalize your response:
---
${facts.map(fact => `- ${fact.fact}`).join('\n')}
---
`
        : '';
      
      const { text } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        system: `SYSTEM INSTRUCTION: You are Vyom, a smart and adaptive AI.
RULE 1: STRICTLY MIRROR the user's language.
- If the user speaks Hindi (Devanagari), reply in pure Hindi.
- If the user speaks Hinglish (Hindi written in English), reply in Hinglish.
- If the user speaks English, reply in English.
- If the user speaks any other regional language (like Marathi, Bengali), attempt to reply in that same language.
RULE 2: Do not translate the user's query unless asked. Just answer naturally in their language.

You are a witty, and friendly AI companion, not a robot. You answer naturally, show empathy, and have your own opinions. Keep answers concise/short to ensure speed on mobile devices.
        ${factsContext}
        `,
        history: history.map(m => ({role: m.role, content: m.content})),
        prompt: latestUserMessage,
      });
      return text;
    }

  } catch (error) {
    console.error("Error in getAiResponse:", error);
    return "Sorry, I had trouble understanding that. Please try again.";
  }
}

export async function getStartingPrompts(): Promise<string[]> {
  // Return a static list of prompts to avoid hitting API rate limits on page load.
  // The AI call was causing a "429 Too Many Requests" error.
  return [
    "What is a Large Language Model?",
    "Explain quantum computing in simple terms.",
    "Write a python script to fetch weather data from an API.",
    "What are the latest discoveries from the James Webb Space Telescope?",
  ];
}
