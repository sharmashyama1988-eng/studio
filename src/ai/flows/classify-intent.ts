'use server';
/**
 * @fileOverview A flow for classifying user intent to optimize responses.
 *
 * - classifyIntent - A function that classifies user input as 'casual' or 'search'.
 * - ClassifyIntentInput - The input type for the classifyIntent function.
 * - ClassifyIntentOutput - The return type for the classifyIntent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyIntentInputSchema = z.object({
  message: z.string().describe('The user message to classify.'),
});
export type ClassifyIntentInput = z.infer<typeof ClassifyIntentInputSchema>;

const ClassifyIntentOutputSchema = z.object({
  intent: z
    .enum(['casual', 'search'])
    .describe(
      "The user's intent. Use 'search' for questions about current events, facts, or data (e.g., 'what is the weather?', 'latest news', 'stock prices', 'who won the match?'). Use 'casual' for general conversation, advice, jokes, coding help, or personal questions."
    ),
});
export type ClassifyIntentOutput = z.infer<typeof ClassifyIntentOutputSchema>;

export async function classifyIntent(input: ClassifyIntentInput): Promise<ClassifyIntentOutput> {
  return classifyIntentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyIntentPrompt',
  input: {schema: ClassifyIntentInputSchema},
  output: {schema: ClassifyIntentOutputSchema},
  prompt: `You are an intent classifier. Your job is to determine if a user's query requires a web search to answer accurately or if it's a casual conversation topic.

  - If the user asks for current, real-time, or fact-based information (like weather, news, scores, prices), classify the intent as 'search'.
  - For anything else (general chat, advice, opinions, jokes, coding help, creative tasks), classify the intent as 'casual'.

  User Message:
  {{{message}}}`,
});

const classifyIntentFlow = ai.defineFlow(
  {
    name: 'classifyIntentFlow',
    inputSchema: ClassifyIntentInputSchema,
    outputSchema: ClassifyIntentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
