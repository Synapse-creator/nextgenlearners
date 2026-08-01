'use server';
/**
 * @fileOverview Finds rhyming words for a given word.
 *
 * - findRhymes - A function that finds rhymes.
 * - FindRhymesInput - The input type for the findRhymes function.
 * - FindRhymesOutput - The return type for the findRhymes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindRhymesInputSchema = z.object({
  word: z.string().describe('The word to find rhymes for.'),
});
export type FindRhymesInput = z.infer<typeof FindRhymesInputSchema>;

const FindRhymesOutputSchema = z.object({
  rhymes: z.array(z.string()).describe('A list of 3-5 simple, common words that rhyme with the input word.'),
});
export type FindRhymesOutput = z.infer<typeof FindRhymesOutputSchema>;

export async function findRhymes(input: FindRhymesInput): Promise<FindRhymesOutput> {
  return findRhymesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findRhymesPrompt',
  input: {schema: FindRhymesInputSchema},
  output: {schema: FindRhymesOutputSchema},
  prompt: `You are a fun and helpful rhyming assistant for young children. Your task is to provide a short list of simple, common words that rhyme with a given word.

  Word: {{{word}}}

  Instructions:
  1.  Generate a list of 3-5 words that rhyme with "{{{word}}}".
  2.  The rhyming words should be simple and easy for a young child (ages 3-8) to read and understand.
  3.  Avoid complex, obscure, or inappropriate words.
  `,
});

const findRhymesFlow = ai.defineFlow(
  {
    name: 'findRhymesFlow',
    inputSchema: FindRhymesInputSchema,
    outputSchema: FindRhymesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
