
'use server';
/**
 * @fileOverview Generates a weekly progress report for a student based on performance data.
 *
 * - generateWeeklyProgressReport - A function that generates the report.
 * - GenerateWeeklyProgressReportInput - The input type for the function.
 * - GenerateWeeklyProgressReportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizScoreSchema = z.object({
  quizTitle: z.string().describe("The title of the quiz."),
  score: z.string().describe("The student's score, formatted as 'score/total' (e.g., '8/10')."),
});

const GenerateWeeklyProgressReportInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  teacherRemarks: z.string().describe("The teacher's personal observations and remarks about the student's week."),
  quizScores: z.array(QuizScoreSchema).describe("An array of the student's recent quiz scores."),
  badgesEarned: z.array(z.string()).describe("A list of badges the student has earned."),
});
export type GenerateWeeklyProgressReportInput = z.infer<typeof GenerateWeeklyProgressReportInputSchema>;

const GenerateWeeklyProgressReportOutputSchema = z.object({
  report: z.string().describe('The generated weekly progress report in a friendly, engaging, and gamified tone suitable for parents and young children.'),
});
export type GenerateWeeklyProgressReportOutput = z.infer<typeof GenerateWeeklyProgressReportOutputSchema>;

export async function generateWeeklyProgressReport(input: GenerateWeeklyProgressReportInput): Promise<GenerateWeeklyProgressReportOutput> {
  return generateWeeklyProgressReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyProgressReportPrompt',
  input: {schema: GenerateWeeklyProgressReportInputSchema},
  output: {schema: GenerateWeeklyProgressReportOutputSchema},
  prompt: `You are an enthusiastic and creative AI assistant for "NextGen Learners", an online school for young children. Your task is to generate a fun, engaging, and gamified weekly progress report for a student named {{{studentName}}}.

  The report should be written in a positive and encouraging tone, directly addressing the parents. Use emojis and playful language to make it enjoyable to read.

  Here is the student's data for the week:
  - **Student's Name**: {{{studentName}}}
  - **Teacher's Remarks**: {{{teacherRemarks}}}
  - **Quiz Scores**:
    {{#each quizScores}}
    - {{{this.quizTitle}}}: {{{this.score}}}
    {{/each}}
  - **Badges Earned This Week**:
    {{#if badgesEarned}}
      {{#each badgesEarned}}
      - {{{this}}}
      {{/each}}
    {{else}}
      None
    {{/if}}

  **Instructions for the report:**
  1.  **Start with a fun greeting**: Address the parents of {{{studentName}}}.
  2.  **Summarize the Week**: Create a "Weekly Adventure Summary" section. Briefly mention the key highlights based on the teacher's remarks.
  3.  **Analyze Quiz Performance**: Create a "Quiz Quest!" section. Comment on the quiz scores. If scores are good, celebrate it! If some are low, frame it as a "new challenge to conquer" and suggest what to practice.
  4.  **Celebrate Achievements**: Create a "Badge Collection!" section. List the badges earned and praise {{{studentName}}} for their hard work. If no badges were earned, encourage them to aim for one next week.
  5.  **Look Ahead**: Create a "Next Week's Mission" section. Briefly mention what's coming up or give a positive and motivating closing statement.
  6.  **Keep it concise and scannable**: Use short paragraphs, bullet points, and emojis.
  `,
});

const generateWeeklyProgressReportFlow = ai.defineFlow(
  {
    name: 'generateWeeklyProgressReportFlow',
    inputSchema: GenerateWeeklyProgressReportInputSchema,
    outputSchema: GenerateWeeklyProgressReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
