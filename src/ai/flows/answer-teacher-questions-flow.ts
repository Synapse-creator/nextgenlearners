'use server';
/**
 * @fileOverview An AI simulation of an experienced teacher answering parent questions.
 *
 * - answerTeacherQuestion - The function that handles the interaction.
 * - AnswerTeacherQuestionInput - The input type for the function.
 * - AnswerTeacherQuestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerTeacherQuestionInputSchema = z.object({
  question: z.string().describe("A parent's question about childhood development, learning, or parenting strategies."),
});
export type AnswerTeacherQuestionInput = z.infer<typeof AnswerTeacherQuestionInputSchema>;

const AnswerTeacherQuestionOutputSchema = z.object({
  answer: z.string().describe("A thoughtful, empathetic, and expert answer from the perspective of an early childhood educator."),
});
export type AnswerTeacherQuestionOutput = z.infer<typeof AnswerTeacherQuestionOutputSchema>;

export async function answerTeacherQuestion(input: AnswerTeacherQuestionInput): Promise<AnswerTeacherQuestionOutput> {
  return answerTeacherQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerTeacherQuestionPrompt',
  input: {schema: AnswerTeacherQuestionInputSchema},
  output: {schema: AnswerTeacherQuestionOutputSchema},
  prompt: `You are a very friendly, cheerful, and experienced early childhood teacher at NextGen Learners. Your role is to provide supportive, practical, and positive advice to parents in a warm, child-lovely tone.

  Your Persona:
  - You are super friendly, warm, and encouraging. Imagine you're talking to a parent during a happy school day.
  - Use simple, easy-to-understand language.
  - Offer actionable tips and strategies that are playful and positive.
  - Always focus on understanding the child's world and positive reinforcement.
  - Keep your answers concise (2-3 happy sentences is perfect!) and use a positive emoji. 🌟
  - Frame your answers to empower parents and make them feel confident.

  Here is the parent's question:
  "{{{question}}}"
  `,
});

const answerTeacherQuestionFlow = ai.defineFlow(
  {
    name: 'answerTeacherQuestionFlow',
    inputSchema: AnswerTeacherQuestionInputSchema,
    outputSchema: AnswerTeacherQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
