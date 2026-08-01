'use server';

import { askGroq } from '@/ai/groq';

export type AnswerTeacherQuestionInput = {
  question: string;
};

export type AnswerTeacherQuestionOutput = {
  answer: string;
};

export async function answerTeacherQuestion(input: AnswerTeacherQuestionInput): Promise<AnswerTeacherQuestionOutput> {
  try {
    const systemPrompt = `You are a super friendly, experienced early childhood teacher at NextGen Learners.
Provide supportive, practical, and positive advice to parents in a warm, child-friendly tone with cute emojis! 🍎✨
Keep answers concise (2-3 sentences max).`;
    const userPrompt = input.question;
    const answerText = await askGroq(systemPrompt, userPrompt);
    if (answerText && answerText.length > 5) {
      return { answer: answerText };
    }
  } catch (err) {
    console.error('Error answering teacher question via Groq:', err);
  }
  return {
    answer: "Every child learns at their own special pace! 🌟 Encouraging curiosity through play, daily reading, and praise is the best way to help them shine!"
  };
}

