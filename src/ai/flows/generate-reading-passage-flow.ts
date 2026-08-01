'use server';

import { askGroq } from '@/ai/groq';

export type GenerateReadingPassageInput = {
  topic: string;
  studentClass: string;
};

export type GenerateReadingPassageOutput = {
  passage: string;
  comprehensionQuestion: { question: string; answer: string };
};

export async function generateReadingPassage(input: GenerateReadingPassageInput): Promise<GenerateReadingPassageOutput> {
  try {
    const systemPrompt = `You are a creative children's author. Write a very short (3-4 sentence) age-appropriate reading passage and one comprehension question. Return JSON:
{"passage":"...","comprehensionQuestion":{"question":"...","answer":"..."}}`;
    const userPrompt = `Topic: ${input.topic}\nClass Level: ${input.studentClass}`;
    const rawJson = await askGroq(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(rawJson);
    if (parsed.passage && parsed.comprehensionQuestion) return parsed;
  } catch (err) {
    console.error('Error generating reading passage via Groq:', err);
  }
  return {
    passage: `Once upon a time, there was a friendly little ${input.topic || 'star'} who loved to learn. Every day, the ${input.topic || 'star'} would explore new things and make new friends. Learning was the greatest adventure of all!`,
    comprehensionQuestion: {
      question: `What did the ${input.topic || 'star'} love to do?`,
      answer: 'Learn and explore!'
    }
  };
}
