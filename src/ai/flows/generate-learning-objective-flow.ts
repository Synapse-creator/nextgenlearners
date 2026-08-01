'use server';
/**
 * @fileOverview Generates a single learning objective for a lesson plan demo.
 *
 * - generateLearningObjective - A function that generates the learning objective.
 * - GenerateLearningObjectiveInput - The input type for the function.
 * - GenerateLearningObjectiveOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLearningObjectiveInputSchema = z.object({
  topic: z.string().describe('The topic for the lesson plan (e.g., "The Solar System").'),
  classLevel: z.string().describe('The class level for which the lesson is intended (e.g., "Class 1", "KG").'),
});
export type GenerateLearningObjectiveInput = z.infer<typeof GenerateLearningObjectiveInputSchema>;

const GenerateLearningObjectiveOutputSchema = z.object({
    objective: z.string().describe("A single, clear, simple, and age-appropriate learning objective for the lesson."),
});
export type GenerateLearningObjectiveOutput = z.infer<typeof GenerateLearningObjectiveOutputSchema>;

export async function generateLearningObjective(input: GenerateLearningObjectiveInput): Promise<GenerateLearningObjectiveOutput> {
  return generateLearningObjectiveFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLearningObjectivePrompt',
  input: {schema: GenerateLearningObjectiveInputSchema},
  output: {schema: GenerateLearningObjectiveOutputSchema},
  prompt: `You are an expert curriculum designer for young children. Your task is to create a single, clear, and engaging learning objective for a lesson.

  Generate one learning objective based on the following details:
  Topic: {{{topic}}}
  Class Level: {{{classLevel}}}

  Instructions:
  1.  Write only ONE learning objective.
  2.  The objective should be clear, simple, and measurable.
  3.  Ensure the language is suitable for a teacher planning a lesson for children in {{{classLevel}}}.
  4.  Example for Topic "Shapes" and Class "KG": "Students will be able to identify and name four basic shapes: circle, square, triangle, and rectangle."
  `,
});

const generateLearningObjectiveFlow = ai.defineFlow(
  {
    name: 'generateLearningObjectiveFlow',
    inputSchema: GenerateLearningObjectiveInputSchema,
    outputSchema: GenerateLearningObjectiveOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
