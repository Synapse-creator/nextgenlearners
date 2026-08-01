'use server';
/**
 * @fileOverview Provides a fun fact/meaning for a name and its Urdu translation.
 *
 * - translateName - A function that handles the name translation and fact generation.
 * - TranslateNameInput - The input type for the function.
 * - TranslateNameOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateNameInputSchema = z.object({
  name: z.string().describe("The name to be translated and described."),
});
export type TranslateNameInput = z.infer<typeof TranslateNameInputSchema>;

const TranslateNameOutputSchema = z.object({
  meaning: z.string().describe("A short, positive, and fun meaning or origin story for the name."),
  urduTranslation: z.string().describe("The translation of the name into Urdu script."),
});
export type TranslateNameOutput = z.infer<typeof TranslateNameOutputSchema>;

export async function translateName(input: TranslateNameInput): Promise<TranslateNameOutput> {
  return translateNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateNamePrompt',
  input: {schema: TranslateNameInputSchema},
  output: {schema: TranslateNameOutputSchema},
  prompt: `You are a friendly and knowledgeable AI assistant specializing in the meanings of names. Your task is to provide a fun fact or meaning for a given name and also translate it into Urdu script.

  Name: {{{name}}}

  Instructions:
  1.  **Meaning/Fun Fact**: Provide a single, positive, and interesting sentence about the name's meaning or origin. Keep it simple and encouraging.
  2.  **Urdu Translation**: Provide the accurate translation of the name "{{{name}}}" in Urdu script. Only provide the Urdu text.
  `,
});

const translateNameFlow = ai.defineFlow(
  {
    name: 'translateNameFlow',
    inputSchema: TranslateNameInputSchema,
    outputSchema: TranslateNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
