'use server';

import { summarizeWebSearchResults } from "@/ai/flows/summarize-web-search-results";
import type { ChatMessage, UserFact } from "@/lib/types";
import { generateStartingPrompts } from "@/ai/flows/generate-starting-prompts";
import { extractUserFacts } from "@/ai/flows/extract-user-facts";

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
  
  const factsContext = facts.length > 0
    ? `
Here are some facts about the user you are talking to. Use them to personalize your response:
---
${facts.map(fact => `- ${fact.fact}`).join('\n')}
---
`
    : '';

  const prompt = `You are Vyom AI, a helpful and intelligent assistant. Below is a user's query. Provide a helpful, well-structured, and concise response. If the query involves code, provide a markdown code snippet with the correct language tag.
  ${factsContext}
  User Query:
  ---
  ${latestUserMessage}
  ---
  `;

  try {
    const result = await summarizeWebSearchResults({ searchResults: prompt });
    return result.summary;
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
}

export async function getStartingPrompts(): Promise<string[]> {
  try {
    const result = await generateStartingPrompts({
      topic: 'AI, technology, and space exploration',
      count: 4,
    });
    return result.prompts;
  } catch (error) {
    console.error("Error getting starting prompts:", error);
    // Provide fallback prompts if the AI call fails
    return [
      "What is a Large Language Model?",
      "Explain quantum computing in simple terms.",
      "Write a python script to fetch weather data from an API.",
      "What are the latest discoveries from the James Webb Space Telescope?",
    ];
  }
}
