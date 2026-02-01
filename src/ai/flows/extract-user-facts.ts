'use server';
/**
 * @fileOverview Extracts personal facts about a user from their input.
 *
 * - extractUserFacts - A function that analyzes user input to find facts.
 * - ExtractUserFactsInput - The input type for the extractUserFacts function.
 * - ExtractUserFactsOutput - The return type for the extractUserFacts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractUserFactsInputSchema = z.object({
  userInput: z.string().describe('The user message to analyze for facts.'),
});
export type ExtractUserFactsInput = z.infer<typeof ExtractUserFactsInputSchema>;

const ExtractUserFactsOutputSchema = z.object({
  facts: z
    .array(z.string())
    .describe('A list of simple, first-person facts extracted from the user input (e.g., "I like to code in Python", "My favorite color is blue"). Return an empty array if no facts are found.'),
});
export type ExtractUserFactsOutput = z.infer<typeof ExtractUserFactsOutputSchema>;

export async function extractUserFacts(input: ExtractUserFactsInput): Promise<ExtractUserFactsOutput> {
  return extractUserFactsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractUserFactsPrompt',
  input: {schema: ExtractUserFactsInputSchema},
  output: {schema: ExtractUserFactsOutputSchema},
  prompt: `Analyze the following user message and extract any personal facts or preferences. A fact is a statement about the user themselves.

  Examples:
  - "My name is John." -> "My name is John."
  - "I'm a software developer and I love to hike." -> ["I am a software developer.", "I love to hike."]
  - "What's the weather like?" -> (no facts)
  - "i prefer typescript over javascript" -> "I prefer TypeScript over JavaScript."

  User Message:
  {{{userInput}}}

  Extract the facts as a JSON array of strings. If no facts are present, return an empty array.`,
});

const extractUserFactsFlow = ai.defineFlow(
  {
    name: 'extractUserFactsFlow',
    inputSchema: ExtractUserFactsInputSchema,
    outputSchema: ExtractUserFactsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
