'use server';
/**
 * @fileOverview Generates a simple, positive kindness quest for a child.
 *
 * - generateKindnessQuest - A function that generates the quest.
 * - GenerateKindnessQuestOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKindnessQuestOutputSchema = z.object({
  quest: z.string().describe("A short, simple, and actionable kindness quest for a child (ages 3-9)."),
});
export type GenerateKindnessQuestOutput = z.infer<typeof GenerateKindnessQuestOutputSchema>;

export async function generateKindnessQuest(): Promise<GenerateKindnessQuestOutput> {
  return generateKindnessQuestFlow();
}

const prompt = ai.definePrompt({
  name: 'generateKindnessQuestPrompt',
  output: {schema: GenerateKindnessQuestOutputSchema},
  prompt: `You are a friendly and encouraging AI assistant for children. Your task is to generate a single, simple, and positive "Kindness Quest" for the day. You must generate a NEW and UNIQUE quest each time.

  Instructions:
  1.  The quest must be a short, single sentence.
  2.  It should be an actionable task that a child between the ages of 3 and 9 can easily understand and complete.
  3.  The tone should be uplifting and fun.
  4.  Do not repeat quests.
  5.  Examples of good quests: "Your mission today is to give a big smile to three different people!", "Can you help a family member with a small chore without being asked?", "Today's quest is to say something nice to a friend.", "Your challenge is to draw a happy picture for someone in your family.", "Can you share one of your toys with a friend today?"
  `,
});

const generateKindnessQuestFlow = ai.defineFlow(
  {
    name: 'generateKindnessQuestFlow',
    outputSchema: GenerateKindnessQuestOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
