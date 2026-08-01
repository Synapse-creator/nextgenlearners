'use server';

import { askGroq } from '@/ai/groq';

export type GenerateLearningObjectiveInput = {
  topic: string;
  classLevel: string;
};

export type GenerateLearningObjectiveOutput = {
  objective: string;
};

export async function generateLearningObjective(input: GenerateLearningObjectiveInput): Promise<GenerateLearningObjectiveOutput> {
  try {
    const systemPrompt = `You are an expert curriculum designer. Generate a single, clear, age-appropriate learning objective for the specified topic and class level. Output ONLY the objective text.`;
    const userPrompt = `Topic: ${input.topic}\nClass Level: ${input.classLevel}`;
    const objText = await askGroq(systemPrompt, userPrompt);
    if (objText && objText.length > 5) {
      return { objective: objText };
    }
  } catch (err) {
    console.error('Error generating learning objective via Groq:', err);
  }
  return {
    objective: `Students will be able to identify and describe key foundational concepts of ${input.topic || 'the topic'} suitable for ${input.classLevel || 'Class 1'}.`
  };
}

