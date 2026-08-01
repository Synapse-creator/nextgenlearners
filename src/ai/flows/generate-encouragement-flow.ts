
'use server';
/**
 * @fileOverview Generates a personalized encouragement message for a student.
 *
 * - generateEncouragement - A function that generates the message.
 * - GenerateEncouragementInput - The input type for the function.
 * - GenerateEncouragementOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEncouragementInputSchema = z.object({
  studentName: z.string().optional().describe('The name of the student.'),
  badges: z.array(z.string()).optional().describe("A list of badges the student has earned recently."),
  recentQuiz: z.object({
    quizTitle: z.string(),
    score: z.number(),
    total: z.number(),
  }).optional().describe("The student's most recent quiz score."),
});
export type GenerateEncouragementInput = z.infer<typeof GenerateEncouragementInputSchema>;

const GenerateEncouragementOutputSchema = z.object({
  message: z.string().describe("A short, positive, and personalized encouragement message for the student."),
});
export type GenerateEncouragementOutput = z.infer<typeof GenerateEncouragementOutputSchema>;

export async function generateEncouragement(input: GenerateEncouragementInput): Promise<GenerateEncouragementOutput> {
  return generateEncouragementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEncouragementPrompt',
  input: {schema: GenerateEncouragementInputSchema},
  output: {schema: GenerateEncouragementOutputSchema},
  prompt: `You are a cheerful and encouraging AI learning buddy for young children at "NextGen Learners". Your task is to generate a short, personalized, and positive message for a student based on their recent activity.

  Student's Name: {{{studentName}}}

  Here's their recent activity:
  {{#if badges}}
  - Badges Earned: {{#each badges}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  {{/if}}
  {{#if recentQuiz}}
  - Latest Quiz: Scored {{{recentQuiz.score}}}/{{{recentQuiz.total}}} on "{{{recentQuiz.quizTitle}}}"
  {{/if}}

  Instructions:
  1.  Start by greeting the student, using their name if available.
  2.  Look at their recent activity. Pick ONE specific achievement to praise.
  3.  If they earned a badge, congratulate them on it.
  4.  If they did well on a quiz (e.g., more than 70% correct), praise their score.
  5.  If they didn't do so well on a quiz, encourage them by saying they are learning and improving.
  6.  If there's no specific activity, just give a general, positive message about learning.
  7.  Keep the message short (1-2 sentences), fun, and use an emoji! 🚀
  `,
});

const generateEncouragementFlow = ai.defineFlow(
  {
    name: 'generateEncouragementFlow',
    inputSchema: GenerateEncouragementInputSchema,
    outputSchema: GenerateEncouragementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
