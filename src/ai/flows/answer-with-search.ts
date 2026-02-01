'use server';
/**
 * @fileOverview A flow for answering questions using a web search tool.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {webSearchTool} from '../tools/web-search';
import type {ChatMessage, UserFact} from '@/lib/types';

const AnswerWithSearchInputSchema = z.object({
  history: z.array(z.custom<ChatMessage>()).describe('The conversation history.'),
  facts: z.array(z.custom<UserFact>()).describe('Facts about the user.'),
});
export type AnswerWithSearchInput = z.infer<typeof AnswerWithSearchInputSchema>;

const AnswerWithSearchOutputSchema = z.string().describe("The AI's response.");
export type AnswerWithSearchOutput = z.infer<typeof AnswerWithSearchOutputSchema>;

export async function answerWithSearch(input: AnswerWithSearchInput): Promise<AnswerWithSearchOutput> {
  return answerWithSearchFlow(input);
}

const answerWithSearchFlow = ai.defineFlow(
  {
    name: 'answerWithSearchFlow',
    inputSchema: AnswerWithSearchInputSchema,
    outputSchema: AnswerWithSearchOutputSchema,
  },
  async ({history, facts}) => {
    const latestUserMessage = history[history.length - 1].content;
    const factsContext =
      facts.length > 0
        ? `
Here are some facts about the user you are talking to. Use them to personalize your response:
---
${facts.map(fact => `- ${fact.fact}`).join('\n')}
---
`
        : '';
    
    const {text} = await ai.generate({
      tools: [webSearchTool],
      model: 'googleai/gemini-2.5-flash',
      system: `You are Vyom, a helpful, witty, and friendly AI companion. You speak in a mix of Hindi and English (Hinglish). Keep answers concise/short. You have access to a web search tool for real-time information.
      ${factsContext}
      `,
      history: history.map(m => ({role: m.role, content: m.content})),
      prompt: latestUserMessage,
    });
    return text;
  }
);
