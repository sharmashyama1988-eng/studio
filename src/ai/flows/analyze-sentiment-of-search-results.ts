'use server';
/**
 * @fileOverview A flow for analyzing the sentiment of web search results.
 *
 * - analyzeSentimentOfSearchResults - A function that orchestrates the sentiment analysis process.
 * - AnalyzeSentimentOfSearchResultsInput - The input type for the analyzeSentimentOfSearchResults function.
 * - AnalyzeSentimentOfSearchResultsOutput - The return type for the analyzeSentimentOfSearchResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentOfSearchResultsInputSchema = z.object({
  query: z.string().describe('The search query to analyze sentiment for.'),
  searchResults: z.string().describe('The web search results to analyze, as a single string.'),
});
export type AnalyzeSentimentOfSearchResultsInput = z.infer<typeof AnalyzeSentimentOfSearchResultsInputSchema>;

const AnalyzeSentimentOfSearchResultsOutputSchema = z.object({
  overallSentiment: z.string().describe('The overall sentiment expressed in the search results (e.g., positive, negative, neutral).'),
  sentimentBreakdown: z.string().describe('A detailed breakdown of the sentiment, including specific examples from the search results.'),
});
export type AnalyzeSentimentOfSearchResultsOutput = z.infer<typeof AnalyzeSentimentOfSearchResultsOutputSchema>;

export async function analyzeSentimentOfSearchResults(input: AnalyzeSentimentOfSearchResultsInput): Promise<AnalyzeSentimentOfSearchResultsOutput> {
  return analyzeSentimentOfSearchResultsFlow(input);
}

const analyzeSentimentOfSearchResultsPrompt = ai.definePrompt({
  name: 'analyzeSentimentOfSearchResultsPrompt',
  input: {schema: AnalyzeSentimentOfSearchResultsInputSchema},
  output: {schema: AnalyzeSentimentOfSearchResultsOutputSchema},
  prompt: `You are an expert in sentiment analysis. Analyze the following web search results for the query "{{query}}" and determine the overall sentiment.

Search Results:
{{searchResults}}

Provide an overall sentiment (positive, negative, or neutral) and a detailed breakdown with specific examples from the search results to support your analysis.

Overall Sentiment:

Sentiment Breakdown: `,
});

const analyzeSentimentOfSearchResultsFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentOfSearchResultsFlow',
    inputSchema: AnalyzeSentimentOfSearchResultsInputSchema,
    outputSchema: AnalyzeSentimentOfSearchResultsOutputSchema,
  },
  async input => {
    const {output} = await analyzeSentimentOfSearchResultsPrompt(input);
    return output!;
  }
);
