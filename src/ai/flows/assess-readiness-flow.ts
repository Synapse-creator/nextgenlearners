
'use server';
/**
 * @fileOverview Generates assessment questions to determine a child's class readiness.
 *
 * - assessReadiness - A function that generates the assessment questions.
 * - AssessReadinessInput - The input type for the function.
 * - AssessReadinessOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessReadinessInputSchema = z.object({
  childAge: z.number().int().min(2).max(8).describe('The age of the child.'),
});
export type AssessReadinessInput = z.infer<typeof AssessReadinessInputSchema>;

const QuestionSchema = z.object({
    questionText: z.string().describe("The text of the assessment question."),
    options: z.array(z.string()).describe("An array of 3-4 simple, possible answers for the question."),
    correctAnswerIndex: z.number().int().min(0).max(3).describe("The 0-based index of the correct answer in the options array."),
    level: z.enum(["PG", "Nursery", "KG", "Class 1"]).describe("The class level this question is designed to assess."),
});

const AssessReadinessOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The array of generated assessment questions.'),
});
export type AssessReadinessOutput = z.infer<typeof AssessReadinessOutputSchema>;

export async function assessReadiness(input: AssessReadinessInput): Promise<AssessReadinessOutput> {
  return assessReadinessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessReadinessPrompt',
  input: {schema: AssessReadinessInputSchema},
  output: {schema: AssessReadinessOutputSchema},
  prompt: `You are an expert in early childhood education. Your task is to generate a simple, 4-question assessment to help a parent determine the most suitable class for their child aged {{{childAge}}}.

  Instructions:
  1.  Generate exactly 4 multiple-choice questions in total.
  2.  The questions should cover a range of age-appropriate skills for a {{{childAge}}}-year-old, touching on basic literacy (letter/sound recognition), numeracy (counting, number recognition), and general concepts (colors, shapes, animals).
  3.  Assign a difficulty 'level' to each question corresponding to the class it assesses. Create a mix of questions from the following levels: "PG", "Nursery", "KG", "Class 1". For example, for a 3-year-old, you might generate 2 PG questions, 1 Nursery, and 1 KG. For a 5-year-old, you might generate 1 Nursery, 2 KG, and 1 Class 1 question.
  4.  Each question must have 3-4 simple, clear options.
  5.  Ensure the questions are fun, engaging, and easy for a parent to ask their child.
  6.  For each question, provide the 0-based index of the correct answer.
  `,
});

const assessReadinessFlow = ai.defineFlow(
  {
    name: 'assessReadinessFlow',
    inputSchema: AssessReadinessInputSchema,
    outputSchema: AssessReadinessOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
