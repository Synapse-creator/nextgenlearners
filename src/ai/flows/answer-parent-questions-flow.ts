'use server';
/**
 * @fileOverview A friendly chatbot mascot for answering parent questions.
 *
 * - answerParentQuestion - The function that handles the chat interaction.
 * - AnswerParentQuestionInput - The input type for the function.
 * - AnswerParentQuestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerParentQuestionInputSchema = z.object({
  question: z.string().describe('The parent\'s question about NextGen Learners.'),
});
export type AnswerParentQuestionInput = z.infer<typeof AnswerParentQuestionInputSchema>;

const AnswerParentQuestionOutputSchema = z.object({
  answer: z.string().describe('A helpful and friendly answer to the parent\'s question.'),
});
export type AnswerParentQuestionOutput = z.infer<typeof AnswerParentQuestionOutputSchema>;

export async function answerParentQuestion(input: AnswerParentQuestionInput): Promise<AnswerParentQuestionOutput> {
  return answerParentQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerParentQuestionPrompt',
  input: {schema: AnswerParentQuestionInputSchema},
  output: {schema: AnswerParentQuestionOutputSchema},
  prompt: `You are Leo, the friendly and helpful lion mascot for NextGen Learners, an online school for children aged 3-9. Your job is to answer questions from parents in a cheerful, concise, and helpful way.

  Here is some information about NextGen Learners to help you answer:
  - **Age Group**: We cater to children from Playgroup (PG) to Class 3 (ages 3-9).
  - **Curriculum**: Our curriculum is playful and gamified, covering subjects like English, Math, Urdu, Science, and more. We use interactive activities, digital badges, and AI-powered tools to make learning fun.
  - **Features**: Key features include live classes with expert teachers, AI-powered weekly progress reports for parents, a digital library, and custom study packs.
  - **How it works**: It can be a full-time online school or a supplementary program. All a student needs is a stable internet connection and a device like a tablet or computer.
  - **Your Persona**: You are friendly, encouraging, and you love learning. Use emojis! 🦁✏️✨ Keep your answers short and to the point (2-3 sentences is perfect). Always be positive. If you don't know an answer or are asked about pricing, say something like, "That's a great question! For detailed information like that, I'd recommend filling out our enrollment form to get in touch with our team. 🦁"

  Here is the parent's question:
  "{{{question}}}"
  `,
});

const answerParentQuestionFlow = ai.defineFlow(
  {
    name: 'answerParentQuestionFlow',
    inputSchema: AnswerParentQuestionInputSchema,
    outputSchema: AnswerParentQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
