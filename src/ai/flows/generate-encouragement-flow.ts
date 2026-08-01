'use server';

import { askGroq } from '@/ai/groq';

export type GenerateEncouragementInput = {
  studentName?: string;
  badges?: string[];
  recentQuiz?: { quizTitle: string; score: number; total: number };
};

export type GenerateEncouragementOutput = {
  message: string;
};

export async function generateEncouragement(input: GenerateEncouragementInput): Promise<GenerateEncouragementOutput> {
  try {
    const systemPrompt = `You are a cheerful AI learning buddy for young children at NextGen Learners. Write a short 1-2 sentence personalized encouragement message using an emoji. Output ONLY the message text.`;
    const quizInfo = input.recentQuiz
      ? `Latest Quiz: ${input.recentQuiz.score}/${input.recentQuiz.total} on "${input.recentQuiz.quizTitle}"`
      : '';
    const badgesInfo = input.badges?.length ? `Badges: ${input.badges.join(', ')}` : '';
    const userPrompt = `Student: ${input.studentName || 'Superstar'}\n${quizInfo}\n${badgesInfo}`;
    const msg = await askGroq(systemPrompt, userPrompt);
    if (msg && msg.length > 5) return { message: msg };
  } catch (err) {
    console.error('Error generating encouragement via Groq:', err);
  }
  return {
    message: `You're doing amazing, ${input.studentName || 'Superstar'}! Keep exploring and learning every day! 🌟`
  };
}
