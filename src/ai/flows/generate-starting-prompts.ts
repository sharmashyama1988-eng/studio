'use server';

/**
 * @fileOverview Generates a set of suggested starting prompts for new users.
 *
 * - generateStartingPrompts - A function that generates the starting prompts.
 * - GenerateStartingPromptsInput - The input type for the generateStartingPrompts function.
 * - GenerateStartingPromptsOutput - The return type for the generateStartingPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStartingPromptsInputSchema = z.object({
  topic: z.string().describe('The general topic or theme for the prompts.'),
  count: z.number().describe('The number of starting prompts to generate.'),
});
export type GenerateStartingPromptsInput = z.infer<typeof GenerateStartingPromptsInputSchema>;

const GenerateStartingPromptsOutputSchema = z.object({
  prompts: z.array(z.string()).describe('An array of generated starting prompts.'),
});
export type GenerateStartingPromptsOutput = z.infer<typeof GenerateStartingPromptsOutputSchema>;

export async function generateStartingPrompts(input: GenerateStartingPromptsInput): Promise<GenerateStartingPromptsOutput> {
  return generateStartingPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStartingPromptsPrompt',
  input: {schema: GenerateStartingPromptsInputSchema},
  output: {schema: GenerateStartingPromptsOutputSchema},
  prompt: `You are an AI prompt generator. Generate {{{count}}} starting prompts related to the topic of {{{topic}}}. Return the prompts as a JSON array of strings.`,
});

const generateStartingPromptsFlow = ai.defineFlow(
  {
    name: 'generateStartingPromptsFlow',
    inputSchema: GenerateStartingPromptsInputSchema,
    outputSchema: GenerateStartingPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
