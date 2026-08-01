'use server';
/**
 * @fileOverview Generates a short, fun story for a child.
 *
 * - generateMiniStory - A function that generates the story.
 * - GenerateMiniStoryInput - The input type for the function.
 * - GenerateMiniStoryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMiniStoryInputSchema = z.object({
  characterName: z.string().describe("The name of the main character in the story."),
  topic: z.string().describe("The main topic or theme of the story (e.g., 'a friendly lion', 'a magical car')."),
});
export type GenerateMiniStoryInput = z.infer<typeof GenerateMiniStoryInputSchema>;

const GenerateMiniStoryOutputSchema = z.object({
  story: z.string().describe('The generated one-paragraph story.'),
});
export type GenerateMiniStoryOutput = z.infer<typeof GenerateMiniStoryOutputSchema>;

export async function generateMiniStory(input: GenerateMiniStoryInput): Promise<GenerateMiniStoryOutput> {
  return generateMiniStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMiniStoryPrompt',
  input: {schema: GenerateMiniStoryInputSchema},
  output: {schema: GenerateMiniStoryOutputSchema},
  prompt: `You are a creative and fun storyteller for young children. Your task is to write a very short, single-paragraph story based on a child's name and a topic.

  Character's Name: {{{characterName}}}
  Story Topic: {{{topic}}}

  Instructions:
  1.  Write a single, happy, and imaginative paragraph.
  2.  The story must feature {{{characterName}}} as the main character.
  3.  The story should be about {{{topic}}}.
  4.  Keep the language simple, positive, and easy for a 3-8 year old to understand.
  5.  The story should be magical and engaging.
  `,
});

const generateMiniStoryFlow = ai.defineFlow(
  {
    name: 'generateMiniStoryFlow',
    inputSchema: GenerateMiniStoryInputSchema,
    outputSchema: GenerateMiniStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
