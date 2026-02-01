'use server';
/**
 * @fileOverview Summarizes web search results using an LLM.
 *
 * - summarizeWebSearchResults - A function that takes web search results and returns a summary.
 * - SummarizeWebSearchResultsInput - The input type for the summarizeWebSearchResults function.
 * - SummarizeWebSearchResultsOutput - The return type for the summarizeWebSearchResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeWebSearchResultsInputSchema = z.object({
  searchResults: z.string().describe('The search results to summarize.'),
});
export type SummarizeWebSearchResultsInput = z.infer<typeof SummarizeWebSearchResultsInputSchema>;

const SummarizeWebSearchResultsOutputSchema = z.object({
  summary: z.string().describe('A summary of the search results.'),
});
export type SummarizeWebSearchResultsOutput = z.infer<typeof SummarizeWebSearchResultsOutputSchema>;

export async function summarizeWebSearchResults(input: SummarizeWebSearchResultsInput): Promise<SummarizeWebSearchResultsOutput> {
  return summarizeWebSearchResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeWebSearchResultsPrompt',
  input: {schema: SummarizeWebSearchResultsInputSchema},
  output: {schema: SummarizeWebSearchResultsOutputSchema},
  prompt: `Summarize the following web search results:\n\n{{searchResults}}`,
});

const summarizeWebSearchResultsFlow = ai.defineFlow(
  {
    name: 'summarizeWebSearchResultsFlow',
    inputSchema: SummarizeWebSearchResultsInputSchema,
    outputSchema: SummarizeWebSearchResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
