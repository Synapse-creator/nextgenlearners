'use server';
/**
 * @fileOverview Generates a snippet of an AI progress report for a fictional student.
 *
 * - generateReportSnippet - A function that generates the report snippet.
 * - GenerateReportSnippetOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportSnippetOutputSchema = z.object({
  snippet: z.string().describe('A short (2-3 sentences) snippet of a weekly progress report. It should be positive, encouraging, and mention a specific achievement.'),
});
export type GenerateReportSnippetOutput = z.infer<typeof GenerateReportSnippetOutputSchema>;

export async function generateReportSnippet(): Promise<GenerateReportSnippetOutput> {
  return generateReportSnippetFlow();
}

const prompt = ai.definePrompt({
  name: 'generateReportSnippetPrompt',
  output: {schema: GenerateReportSnippetOutputSchema},
  prompt: `You are an enthusiastic AI assistant for "NextGen Learners". Your task is to generate a short, positive, and engaging snippet from a weekly progress report for a fictional student named "Zayn".

  Instructions:
  1.  Write 2-3 sentences in a friendly and encouraging tone, as if addressing Zayn's parents.
  2.  Mention a specific, positive achievement. You can invent one. Examples: doing well on a "Number Ninjas" quiz, earning a "Reading Rockstar" badge, or showing great creativity in an art project.
  3.  Use playful language and include an emoji.
  4.  Example: "Zayn had a fantastic week in our digital classroom! 🚀 He showed amazing focus during his 'Number Ninjas' quiz and earned a new 'Math Magician' badge for his collection. We are so proud of his progress!"
  `,
});

const generateReportSnippetFlow = ai.defineFlow(
  {
    name: 'generateReportSnippetFlow',
    outputSchema: GenerateReportSnippetOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
