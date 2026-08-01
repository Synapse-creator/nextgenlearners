'use server';
/**
 * @fileOverview Generates a multiple-choice quiz based on a given topic and class level.
 *
 * - generateQuiz - A function that generates the quiz.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
  questionText: z.string().describe("The text of the quiz question."),
  options: z.array(z.string()).describe("An array of 4 possible answers for the question."),
  correctAnswerIndex: z.number().int().min(0).max(3).describe("The 0-based index of the correct answer in the options array."),
  explanation: z.string().describe("A brief and simple explanation for why the correct answer is right.")
});

const GenerateQuizInputSchema = z.object({
  prompt: z.string().describe('The teacher\'s prompt for the quiz (e.g., "A quiz about summer fruits", "Photosynthesis basics").'),
  classLevel: z.string().describe('The class level for which the quiz is intended (e.g., "Class 1", "KG").'),
  numQuestions: z.number().int().positive().describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  title: z.string().describe("A creative and fun title for the quiz, based on the teacher's prompt."),
  questions: z.array(QuestionSchema).describe('The array of generated quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert educator and a fun quiz creator for young children. Your task is to generate an engaging, age-appropriate, multiple-choice quiz.

  Generate a quiz based on the following details:
  Teacher's Prompt: {{{prompt}}}
  Class Level: {{{classLevel}}}
  Number of Questions: {{{numQuestions}}}

  Instructions:
  1.  Create a fun and creative title for the quiz based on the teacher's prompt.
  2.  Generate exactly {{{numQuestions}}} questions.
  3.  Each question must have exactly 4 options.
  4.  The questions and options should be simple, clear, and perfectly suitable for a child in {{{classLevel}}}. For younger classes like PG, Nursery, and KG, use very simple vocabulary and concepts.
  5.  For each question, provide the 0-based index of the correct answer.
  6.  For each question, provide a simple, one-sentence explanation for the correct answer that a child can understand.
  7.  Ensure the quiz is directly related to the specified topic in the teacher's prompt.
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
