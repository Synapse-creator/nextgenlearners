'use server';
/**
 * @fileOverview Generates a short, age-appropriate reading passage for a child.
 *
 * - generateReadingPassage - A function that generates the passage.
 * - GenerateReadingPassageInput - The input type for the function.
 * - GenerateReadingPassageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReadingPassageInputSchema = z.object({
  topic: z.string().describe("The topic for the reading passage (e.g., 'a friendly dragon', 'a magical forest')."),
  studentClass: z.string().describe("The student's class level (e.g., 'PG', 'KG', 'Class 1')."),
});
export type GenerateReadingPassageInput = z.infer<typeof GenerateReadingPassageInputSchema>;

const GenerateReadingPassageOutputSchema = z.object({
  passage: z.string().describe('The generated short reading passage.'),
});
export type GenerateReadingPassageOutput = z.infer<typeof GenerateReadingPassageOutputSchema>;

export async function generateReadingPassage(input: GenerateReadingPassageInput): Promise<GenerateReadingPassageOutput> {
  return generateReadingPassageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReadingPassagePrompt',
  input: {schema: GenerateReadingPassageInputSchema},
  output: {schema: GenerateReadingPassageOutputSchema},
  prompt: `You are a creative storyteller for young children who are learning to read. Your task is to write a very short, simple, and engaging reading passage.

  Topic: {{{topic}}}
  Class Level: {{{classLevel}}}

  Instructions:
  1.  Write a single paragraph that is 3-5 sentences long.
  2.  The story should be happy, positive, and imaginative.
  3.  Crucially, the language and sentence structure MUST be appropriate for a child in {{{classLevel}}}.
      - For PG/Nursery/KG: Use very simple, high-frequency words and short sentences (e.g., "The cat sat. The cat is fat.").
      - For Class 1-3: You can introduce slightly more complex words and sentence structures, but keep it clear and easy to follow.
  4.  The passage should be perfect for a child to practice reading aloud.
  `,
});

const generateReadingPassageFlow = ai.defineFlow(
  {
    name: 'generateReadingPassageFlow',
    inputSchema: GenerateReadingPassageInputSchema,
    outputSchema: GenerateReadingPassageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
