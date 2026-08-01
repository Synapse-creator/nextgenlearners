'use server';
/**
 * @fileOverview Generates a lesson plan for a teacher based on a topic and class level.
 *
 * - generateLessonPlan - A function that generates the lesson plan.
 * - GenerateLessonPlanInput - The input type for the generateLessonPlan function.
 * - GenerateLessonPlanOutput - The return type for the generateLessonPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonPlanInputSchema = z.object({
  topic: z.string().describe('The topic for the lesson plan (e.g., "The five senses", "Introduction to shapes").'),
  classLevel: z.string().describe('The class level for which the lesson is intended (e.g., "Class 1", "KG").'),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
    learningObjectives: z.array(z.string()).describe("A list of 2-3 clear, simple learning objectives for the lesson."),
    talkingPoints: z.array(z.string()).describe("A list of key talking points or a simple script to guide the teacher during the lesson."),
    activityIdea: z.object({
        title: z.string().describe("A fun and creative title for the activity."),
        description: z.string().describe("A brief description of the interactive activity for the students."),
    }).describe("An idea for a simple, engaging, and age-appropriate activity."),
    quizQuestion: z.object({
        question: z.string().describe("A sample multiple-choice question to check for understanding."),
        options: z.array(z.string()).describe("An array of 3-4 possible answers for the question."),
        correctAnswer: z.string().describe("The correct answer from the options array."),
    }).describe("A sample quiz question related to the lesson."),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

export async function generateLessonPlan(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  input: {schema: GenerateLessonPlanInputSchema},
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `You are an expert curriculum designer for young children. Your task is to create a simple, engaging, and age-appropriate lesson plan.

  Generate a lesson plan based on the following details:
  Topic: {{{topic}}}
  Class Level: {{{classLevel}}}

  Instructions:
  1.  **Learning Objectives**: Write 2-3 clear and simple learning objectives that a child in {{{classLevel}}} should achieve by the end of the lesson.
  2.  **Talking Points**: Create a list of simple, friendly talking points or a mini-script that a teacher can use to explain the topic. Use vocabulary suitable for {{{classLevel}}}.
  3.  **Activity Idea**: Come up with a fun, creative, and simple activity that children can do to reinforce the lesson. Give it a catchy title and a short description.
  4.  **Quiz Question**: Write one simple multiple-choice question to quickly assess understanding. Provide the question, 3-4 options, and clearly state the correct answer.
  `,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
